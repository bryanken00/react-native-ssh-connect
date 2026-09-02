/**
 * A small ANSI-aware line buffer.
 *
 * A remote shell does not send text — it sends a byte stream with escape
 * sequences interleaved, arriving in chunks that split wherever the network
 * felt like splitting them. This turns that stream into an array of styled
 * lines a FlatList can render.
 *
 * ── What it implements ──────────────────────────────────────────────────────
 *   SGR (`ESC[…m`)  bold, dim, italic, underline, inverse, the 16 ANSI
 *                   colours, 256-colour (`38;5;n`) and truecolor (`38;2;r;g;b`)
 *   Erase           `ESC[K` (line) and `ESC[2J` (screen)
 *   Horizontal      `ESC[C`, `ESC[D`, `ESC[G`, `ESC[P`, `\r`, `\b`, `\t`
 *   Ignored safely  OSC (window titles), DCS/APC/PM, charset designators,
 *                   private modes (`ESC[?25l`, alt-screen), and every CSI it
 *                   does not know
 *
 * ── What it deliberately does not ───────────────────────────────────────────
 * There is no viewport and no cursor row, so **vertical** cursor movement
 * (`ESC[A`, `ESC[H`, scroll regions) is dropped. Line-oriented tools — shells,
 * `ls`, `git`, `npm`, compilers, `tail -f` — render correctly. Full-screen
 * programs that paint by absolute position — `vim`, `htop`, `top`, `less` —
 * will not: they still *work* on the server, but the output stacks instead of
 * repainting in place. Adding a real grid emulator is the upgrade path; it is
 * a much larger piece of code than this and most sessions never need it.
 *
 * ── Rendering contract ──────────────────────────────────────────────────────
 * `snapshot()` returns a fresh array, but the line objects inside it are only
 * replaced when that line actually changed. That is what lets `TerminalLine`
 * be a `React.memo` and skip re-rendering 2000 untouched lines every time a
 * byte arrives.
 *
 * Colours are stored as palette *names* ("red", "brightCyan"), not values, and
 * resolved at render against `useTerminalPalette()` — so toggling dark mode
 * re-colours scrollback that arrived an hour ago. Only 256-colour and
 * truecolor produce literal `#rrggbb`, because those carry no name to resolve.
 */

const BASE_STYLE = {
  fg: null,
  bg: null,
  bold: false,
  dim: false,
  italic: false,
  underline: false,
  inverse: false,
};

const BASIC_COLORS = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
];

const brightName = (i) =>
  `bright${BASIC_COLORS[i][0].toUpperCase()}${BASIC_COLORS[i].slice(1)}`;

const TAB_WIDTH = 8;

// ── Segment helpers ──────────────────────────────────────────────────────────

const lineLength = (segments) =>
  segments.reduce((n, s) => n + s.text.length, 0);

const sameStyle = (a, b) =>
  a.fg === b.fg &&
  a.bg === b.bg &&
  a.bold === b.bold &&
  a.dim === b.dim &&
  a.italic === b.italic &&
  a.underline === b.underline &&
  a.inverse === b.inverse;

/**
 * Coalesce neighbours that share a style and drop empties. Without this a
 * chunked stream fragments one line into hundreds of one-character segments,
 * each of which becomes a nested <Text> node.
 */
const mergeSegments = (segments) => {
  const out = [];
  for (const seg of segments) {
    if (!seg.text) continue;
    const last = out[out.length - 1];
    if (last && sameStyle(last, seg)) {
      out[out.length - 1] = { ...last, text: last.text + seg.text };
    } else {
      out.push(seg);
    }
  }
  return out;
};

/** Everything strictly left of `col`, styles preserved. */
const truncateSegments = (segments, col) => {
  const out = [];
  let pos = 0;
  for (const seg of segments) {
    const start = pos;
    const end = pos + seg.text.length;
    pos = end;
    if (end <= col) {
      out.push(seg);
      continue;
    }
    if (start < col) out.push({ ...seg, text: seg.text.slice(0, col - start) });
    break;
  }
  return out;
};

/**
 * Overwrite `text` into the line at `col`, the way a real terminal does — this
 * is what makes `\r`-redrawn prompts and progress bars land in place instead
 * of stacking up.
 */
const spliceSegments = (segments, col, text, style) => {
  if (!text) return segments;

  const end = col + text.length;
  const head = [];
  const tail = [];
  let pos = 0;

  for (const seg of segments) {
    const start = pos;
    const segEnd = pos + seg.text.length;
    pos = segEnd;

    if (segEnd <= col) {
      head.push(seg);
      continue;
    }
    if (start >= end) {
      tail.push(seg);
      continue;
    }
    // Overlaps the written span — keep whatever sticks out either side.
    if (start < col) head.push({ ...seg, text: seg.text.slice(0, col - start) });
    if (segEnd > end) tail.push({ ...seg, text: seg.text.slice(end - start) });
  }

  // Cursor parked past the end of the line (a tab, or `ESC[G`) — pad the gap.
  const gap = col - lineLength(head);
  if (gap > 0) head.push({ ...BASE_STYLE, text: " ".repeat(gap) });

  return mergeSegments([...head, { ...style, text }, ...tail]);
};

// ── Colour decoding ──────────────────────────────────────────────────────────

const toHex = (r, g, b) =>
  `#${[r, g, b].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("")}`;

/** xterm's 256-colour cube. 0–15 stay named so they follow the theme. */
const xterm256 = (n) => {
  if (n < 8) return BASIC_COLORS[n];
  if (n < 16) return brightName(n - 8);
  if (n < 232) {
    const c = n - 16;
    const level = (v) => (v === 0 ? 0 : 55 + v * 40);
    return toHex(
      level(Math.floor(c / 36)),
      level(Math.floor((c % 36) / 6)),
      level(c % 6),
    );
  }
  const grey = 8 + (n - 232) * 10;
  return toHex(grey, grey, grey);
};

/**
 * Apply one `ESC[…m` sequence to a style.
 *
 * Returns a new object rather than mutating: styles are shared by reference
 * with every segment already written, so mutating would retroactively recolour
 * the whole scrollback.
 */
const applySgr = (style, params) => {
  const codes = params.length ? params : [0];
  let next = { ...style };

  for (let i = 0; i < codes.length; i++) {
    const code = codes[i];

    // Extended colour: 38/48 followed by ;5;n (256) or ;2;r;g;b (truecolor)
    if (code === 38 || code === 48) {
      const channel = code === 38 ? "fg" : "bg";
      if (codes[i + 1] === 5) {
        next[channel] = xterm256(codes[i + 2] ?? 0);
        i += 2;
      } else if (codes[i + 1] === 2) {
        next[channel] = toHex(codes[i + 2] ?? 0, codes[i + 3] ?? 0, codes[i + 4] ?? 0);
        i += 4;
      }
      continue;
    }

    if (code === 0) next = { ...BASE_STYLE };
    else if (code === 1) next.bold = true;
    else if (code === 2) next.dim = true;
    else if (code === 3) next.italic = true;
    else if (code === 4) next.underline = true;
    else if (code === 7) next.inverse = true;
    else if (code === 22) next = { ...next, bold: false, dim: false };
    else if (code === 23) next.italic = false;
    else if (code === 24) next.underline = false;
    else if (code === 27) next.inverse = false;
    else if (code >= 30 && code <= 37) next.fg = BASIC_COLORS[code - 30];
    else if (code === 39) next.fg = null;
    else if (code >= 40 && code <= 47) next.bg = BASIC_COLORS[code - 40];
    else if (code === 49) next.bg = null;
    else if (code >= 90 && code <= 97) next.fg = brightName(code - 90);
    else if (code >= 100 && code <= 107) next.bg = brightName(code - 100);
  }

  return next;
};

// ── Buffer ───────────────────────────────────────────────────────────────────

/**
 * @param {number} maxLines - scrollback cap; older lines are dropped from the
 *                            front. 2000 lines is roughly a megabyte of text
 *                            worst case and scrolls without stutter.
 */
export const createTerminalBuffer = ({ maxLines = 2000 } = {}) => {
  let seq = 0;
  let lines = [{ key: ++seq, segments: [], system: null }];
  let col = 0;
  let style = { ...BASE_STYLE };
  /** Tail of a chunk that ended mid-escape-sequence, prepended to the next. */
  let pending = "";

  const current = () => lines[lines.length - 1];

  const replaceCurrent = (patch) => {
    lines[lines.length - 1] = { ...current(), ...patch };
  };

  const newLine = () => {
    lines.push({ key: ++seq, segments: [], system: null });
    col = 0;
    // Real terminals wrap `\n` as line-feed only, but every shell in practice
    // sends `\r\n`. Resetting the column keeps output sane if one does not.
    if (lines.length > maxLines) lines = lines.slice(lines.length - maxLines);
  };

  const putText = (text) => {
    replaceCurrent({
      segments: spliceSegments(current().segments, col, text, style),
    });
    col += text.length;
  };

  const eraseInLine = (mode) => {
    const segments = current().segments;
    if (mode === 0) {
      replaceCurrent({ segments: truncateSegments(segments, col) });
    } else if (mode === 1) {
      replaceCurrent({
        segments: spliceSegments(segments, 0, " ".repeat(col), BASE_STYLE),
      });
    } else {
      replaceCurrent({ segments: [] });
    }
  };

  const deleteChars = (n) => {
    const segments = current().segments;
    const kept = truncateSegments(segments, col);
    const rest = [];
    let pos = 0;
    const from = col + n;
    for (const seg of segments) {
      const start = pos;
      const end = pos + seg.text.length;
      pos = end;
      if (end <= from) continue;
      rest.push({
        ...seg,
        text: start >= from ? seg.text : seg.text.slice(from - start),
      });
    }
    replaceCurrent({ segments: mergeSegments([...kept, ...rest]) });
  };

  const handleCsi = (raw, final) => {
    // `?` marks a private mode (cursor visibility, alt screen, bracketed
    // paste). None of them mean anything without a viewport.
    if (raw.startsWith("?") || raw.startsWith(">") || raw.startsWith("<")) return;

    const params = raw
      .split(";")
      .map((p) => (p === "" ? 0 : parseInt(p, 10)))
      .map((p) => (Number.isNaN(p) ? 0 : p));
    const first = params[0] ?? 0;

    switch (final) {
      case "m":
        style = applySgr(style, raw === "" ? [] : params);
        break;
      case "K":
        eraseInLine(first);
        break;
      case "J":
        // 2 = whole screen, 3 = screen + scrollback. Both read as "clear".
        if (first === 2 || first === 3) clear();
        else if (first === 0) eraseInLine(0);
        break;
      case "C":
        col += Math.max(1, first);
        break;
      case "D":
        col = Math.max(0, col - Math.max(1, first));
        break;
      case "G":
      case "`":
        col = Math.max(0, Math.max(1, first) - 1);
        break;
      case "H":
      case "f":
        // Row is meaningless here; honour the column so `ESC[H` at least
        // returns to the start of the line rather than being ignored.
        col = Math.max(0, Math.max(1, params[1] ?? 1) - 1);
        break;
      case "P":
        deleteChars(Math.max(1, first));
        break;
      default:
        // A, B, E, F, S, T, r … all vertical. See the note at the top.
        break;
    }
  };

  /**
   * @returns the number of characters consumed, or -1 if the sequence is
   *          incomplete and we need the next chunk to finish it.
   */
  const parseEscape = (data, i) => {
    if (i + 1 >= data.length) return -1;
    const kind = data[i + 1];

    // CSI — parameters, then a final byte in @…~
    if (kind === "[") {
      let j = i + 2;
      while (j < data.length && !/[@-~]/.test(data[j])) j++;
      if (j >= data.length) return -1;
      handleCsi(data.slice(i + 2, j), data[j]);
      return j - i + 1;
    }

    // OSC — window title and friends. Ends at BEL or ST.
    if (kind === "]") {
      const bel = data.indexOf("\x07", i + 2);
      const st = data.indexOf("\x1b\\", i + 2);
      if (bel === -1 && st === -1) return -1;
      const end = bel === -1 ? st + 1 : bel;
      return end - i + 1;
    }

    // DCS / SOS / PM / APC — opaque payloads, terminated by ST.
    if (kind === "P" || kind === "X" || kind === "^" || kind === "_") {
      const st = data.indexOf("\x1b\\", i + 2);
      if (st === -1) return -1;
      return st + 2 - i;
    }

    // Charset designation: ESC ( B and friends — one more byte to swallow.
    if (kind === "(" || kind === ")" || kind === "*" || kind === "+") {
      if (i + 2 >= data.length) return -1;
      return 3;
    }

    // Everything else is a two-byte escape (ESC 7, ESC M, ESC =, …).
    return 2;
  };

  const handleControl = (ch) => {
    if (ch === "\n" || ch === "\v" || ch === "\f") newLine();
    else if (ch === "\r") col = 0;
    else if (ch === "\b") col = Math.max(0, col - 1);
    else if (ch === "\t") col += TAB_WIDTH - (col % TAB_WIDTH);
    // BEL, NUL and the rest carry no visible meaning here.
  };

  const clear = () => {
    seq += 1;
    lines = [{ key: seq, segments: [], system: null }];
    col = 0;
  };

  return {
    /** Feed one chunk off the wire. Safe to call with a partial escape. */
    write(chunk) {
      if (!chunk) return;
      const data = pending + String(chunk);
      pending = "";

      let i = 0;
      while (i < data.length) {
        const ch = data[i];

        if (ch === "\x1b") {
          const consumed = parseEscape(data, i);
          if (consumed === -1) {
            // Hold the fragment back rather than printing it as garbage.
            pending = data.slice(i);
            return;
          }
          i += consumed;
          continue;
        }

        if (ch < " " || ch === "\x7f") {
          handleControl(ch);
          i++;
          continue;
        }

        // Take the whole printable run in one splice, not character by
        // character — this is the hot path for anything that prints fast.
        let j = i;
        while (
          j < data.length &&
          data[j] >= " " &&
          data[j] !== "\x7f" &&
          data[j] !== "\x1b"
        ) {
          j++;
        }
        putText(data.slice(i, j));
        i = j;
      }
    },

    /**
     * A line the app wrote, not the server — "Connecting…", a disconnect
     * notice, an error. Rendered muted so it never passes for shell output.
     *
     * @param {'info'|'error'} tone
     */
    writeSystem(text, tone = "info") {
      if (lineLength(current().segments) > 0) newLine();
      replaceCurrent({
        segments: [{ ...BASE_STYLE, text }],
        system: tone,
      });
      newLine();
    },

    /** Fresh array, stable line objects — see the rendering contract above. */
    snapshot() {
      return lines.slice();
    },

    clear() {
      clear();
    },
  };
};
