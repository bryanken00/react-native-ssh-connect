/**
 * A simulated shell, so the whole flow — add a host, tap it, type, read output
 * — runs in Expo Go and on web with no native build and no server.
 *
 * It exists for the same reason `IS_DEMO` does elsewhere in this template: you
 * should be able to explore and lay out a screen before the real thing is
 * wired up. It presents **exactly** the interface `nativeClient` presents, so
 * nothing above this file branches on which one it got.
 *
 * It speaks real ANSI — coloured prompt, `\r` redraws, `ESC[2J` on Ctrl-L —
 * partly because a fake shell that emits plain text would let a broken parser
 * look fine, and partly so the terminal is styled the way it will be in
 * production.
 *
 * It is a stub, not an emulator: it does line editing, a command history and
 * about a dozen commands. It never touches the network.
 */

const PROMPT_LATENCY = 45;
const CONNECT_LATENCY = 700;

/** Green user@host, blue cwd — the Debian/Ubuntu default, roughly. */
const prompt = (host, cwd = "~") =>
  `\x1b[1;32m${host.username}@${host.host}\x1b[0m:\x1b[1;34m${cwd}\x1b[0m$ `;

/**
 * Shown once, the first time someone types something this stub does not know.
 *
 * Without it the only feedback is `command not found`, which is exactly what a
 * real shell says for a typo — so a stub with fifteen commands reads as a
 * broken server rather than a stub. Saying it once is enough; repeating it on
 * every unknown command would be worse than saying nothing.
 */
const UNKNOWN_HINT =
  "\x1b[2m(this is the simulated shell — `help` lists what it knows. " +
  "Build with a development client for a real one.)\x1b[0m";

/**
 * Resolve a `cd` argument against the current directory.
 *
 * There is no filesystem behind this, so every path is accepted — `cd` here
 * moves the prompt and nothing else. It exists because `cd` is the first thing
 * anyone types, and a shell that rejects it feels broken in a way the missing
 * fifteen others do not.
 */
const resolveCwd = (cwd, target) => {
  if (!target || target === "~") return "~";
  if (target === "-") return cwd;
  if (target === "..") {
    if (cwd === "~" || cwd === "/") return cwd;
    const parent = cwd.slice(0, cwd.lastIndexOf("/"));
    return parent === "" ? "/" : parent;
  }
  if (target === ".") return cwd;
  if (target.startsWith("/")) return target;
  return cwd === "/" ? `/${target}` : `${cwd}/${target}`;
};

const BANNER = (host) =>
  [
    `\x1b[2mSimulated session — no network traffic left this device.\x1b[0m`,
    ``,
    `Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-generic x86_64)`,
    ``,
    ` * Documentation:  https://help.ubuntu.com`,
    ` * Support:        https://ubuntu.com/pro`,
    ``,
    `Last login: ${new Date().toUTCString()} from 10.0.0.14`,
    `\x1b[33mBuild this app with a development client to reach ${host.host} for real.\x1b[0m`,
    ``,
  ].join("\r\n");

const LS_COLOURED = [
  "\x1b[1;34mDocuments\x1b[0m  \x1b[1;34mdownloads\x1b[0m  \x1b[1;32mdeploy.sh\x1b[0m",
  "\x1b[1;34mprojects\x1b[0m   notes.md   README.md",
].join("\r\n");

const LS_LONG = [
  "total 28",
  "drwxr-xr-x  4 %u %u 4096 Mar  3 09:12 \x1b[1;34m.\x1b[0m",
  "drwxr-xr-x 18 root  root  4096 Feb 11 22:04 \x1b[1;34m..\x1b[0m",
  "-rw-------  1 %u %u 1204 Mar  3 09:10 .bash_history",
  "drwxr-xr-x  2 %u %u 4096 Feb 28 17:41 \x1b[1;34mDocuments\x1b[0m",
  "-rwxr-xr-x  1 %u %u  842 Mar  1 11:02 \x1b[1;32mdeploy.sh\x1b[0m",
  "-rw-r--r--  1 %u %u  219 Mar  2 08:55 notes.md",
].join("\r\n");

const HELP = [
  "This is a simulated shell. It understands:",
  "",
  "  help            this message",
  "  ls [-la]        list files",
  "  cd <dir>        change directory (moves the prompt, nothing else)",
  "  pwd             working directory",
  "  whoami / id     current user",
  "  hostname        this host",
  "  uname -a        kernel string",
  "  uptime / free   fake system stats",
  "  ps              fake process list",
  "  date            current time",
  "  echo <text>     print text",
  "  cat notes.md    print a file",
  "  clear           clear the screen  (also Ctrl-L)",
  "  exit            close the session (also Ctrl-D)",
  "",
  "That is the whole list — there is no server behind this and no filesystem.",
  "Anything else reports 'command not found', same as the real thing would.",
  "",
  "For a shell that actually runs commands, build the app with a development",
  "client:  npx expo prebuild  &&  npx expo run:android",
].join("\r\n");

/**
 * @returns {{output: string, clear?: boolean, close?: boolean,
 *            unknown?: boolean, cwd?: string}}
 */
const runCommand = (input, host, cwd) => {
  const line = input.trim();
  if (!line) return { output: "" };

  const [cmd, ...args] = line.split(/\s+/);
  const rest = args.join(" ");
  const u = host.username;
  // The prompt shows `~`, but `pwd` always prints the real path — expand any
  // leading tilde, not just a bare one, or `pwd` in ~/projects reports "~/projects".
  const absoluteCwd = cwd.startsWith("~")
    ? `/home/${u}${cwd.slice(1)}`
    : cwd;

  switch (cmd) {
    case "help":
      return { output: HELP };
    case "ls":
      return {
        output: args.some((a) => a.startsWith("-") && a.includes("l"))
          ? LS_LONG.replaceAll("%u", u.padEnd(5).slice(0, 5))
          : LS_COLOURED,
      };
    case "cd":
      return { output: "", cwd: resolveCwd(cwd, args[0]) };
    case "pwd":
      return { output: absoluteCwd };
    case "whoami":
      return { output: u };
    case "id":
      return { output: `uid=1000(${u}) gid=1000(${u}) groups=1000(${u}),27(sudo)` };
    case "hostname":
      return { output: host.host };
    case "uname":
      return {
        output: rest.includes("a")
          ? `Linux ${host.host} 6.8.0-generic #1 SMP x86_64 GNU/Linux`
          : "Linux",
      };
    case "uptime":
      return {
        output:
          " 09:41:22 up 12 days,  3:07,  1 user,  load average: 0.08, 0.12, 0.09",
      };
    case "free":
      return {
        output: [
          "               total        used        free      shared",
          "Mem:         8039132     2314820     3901244      184320",
          "Swap:        2097148           0     2097148",
        ].join("\r\n"),
      };
    case "ps":
      return {
        output: [
          "    PID TTY          TIME CMD",
          "   4021 pts/0    00:00:00 bash",
          "   4188 pts/0    00:00:00 ps",
        ].join("\r\n"),
      };
    case "date":
      return { output: new Date().toString() };
    case "echo":
      return { output: rest };
    case "cat":
      return {
        output:
          rest === "notes.md"
            ? "Remember to rotate the deploy key before the end of the month."
            : `cat: ${rest || "''"}: No such file or directory`,
      };
    case "clear":
      return { output: "", clear: true };
    case "exit":
    case "logout":
      return { output: "", close: true };
    default:
      return {
        output: `\x1b[31m${cmd}: command not found\x1b[0m`,
        unknown: true,
      };
  }
};

/**
 * Same signature and same return shape as `nativeClient.connect`.
 *
 * @returns {Promise<{write: Function, close: Function}>}
 */
export const connect = async ({ host, onData, onClose }) => {
  await new Promise((resolve) => setTimeout(resolve, CONNECT_LATENCY));

  let closed = false;
  let line = "";
  let cwd = "~";
  let hintShown = false;
  const history = [];
  let historyIndex = 0;

  const emit = (text) => {
    if (!closed) onData(text);
  };

  /** Wipe the edited line and redraw it — what a real PTY does for history. */
  const redraw = (next) => {
    line = next;
    emit(`\r\x1b[K${prompt(host, cwd)}${line}`);
  };

  const finish = () => {
    if (closed) return;
    closed = true;
    onClose?.("Session closed by remote host.");
  };

  emit(BANNER(host));
  emit(prompt(host, cwd));

  const submit = () => {
    const input = line;
    line = "";
    emit("\r\n");

    if (input.trim()) {
      history.push(input);
      historyIndex = history.length;
    }

    // A real shell takes a moment to answer; instant output reads as fake and
    // hides any flicker the terminal has when data lands mid-frame.
    setTimeout(() => {
      if (closed) return;
      const result = runCommand(input, host, cwd);

      if (result.close) {
        emit("logout\r\n");
        finish();
        return;
      }
      // ESC[2J clears, ESC[H homes the cursor — what the real `clear` sends.
      if (result.clear) emit("\x1b[2J\x1b[H");
      if (result.cwd) cwd = result.cwd;
      if (result.output) emit(`${result.output}\r\n`);

      // Say what this shell is, once, the first time it disappoints someone.
      if (result.unknown && !hintShown) {
        hintShown = true;
        emit(`${UNKNOWN_HINT}\r\n`);
      }

      emit(prompt(host, cwd));
    }, PROMPT_LATENCY);
  };

  return {
    write: async (data) => {
      if (closed) return;

      for (let i = 0; i < data.length; i++) {
        const ch = data[i];

        // Arrow keys arrive as three bytes; consume all three together.
        if (ch === "\x1b" && data[i + 1] === "[") {
          const key = data[i + 2];
          i += 2;
          if (key === "A" && historyIndex > 0) {
            redraw(history[--historyIndex] ?? "");
          } else if (key === "B") {
            historyIndex = Math.min(historyIndex + 1, history.length);
            redraw(history[historyIndex] ?? "");
          }
          continue;
        }

        if (ch === "\r" || ch === "\n") {
          submit();
          continue;
        }
        if (ch === "\x7f" || ch === "\b") {
          if (line.length) {
            line = line.slice(0, -1);
            emit("\b \b");
          }
          continue;
        }
        if (ch === "\x03") {
          // Ctrl-C: abandon the line, echo the caret the shell would.
          line = "";
          emit(`^C\r\n${prompt(host, cwd)}`);
          continue;
        }
        if (ch === "\x04") {
          if (!line.length) {
            emit("logout\r\n");
            finish();
          }
          continue;
        }
        if (ch === "\x0c") {
          emit("\x1b[2J\x1b[H");
          emit(prompt(host, cwd) + line);
          continue;
        }
        if (ch === "\t" || ch < " ") continue;

        line += ch;
        emit(ch); // local echo, exactly as a PTY would
      }
    },

    close: () => {
      closed = true;
    },
  };
};
