import { memo } from "react";
import { Text } from "react-native";

/**
 * One line of scrollback.
 *
 * This is the only component in the app that sets colour from a value rather
 * than a class, and it has to: the colour was chosen by the remote host at
 * runtime. `palette` comes from `useTerminalPalette()`, so a theme toggle
 * recolours every line already on screen.
 *
 * `React.memo` matters more here than anywhere else in the repo. The terminal
 * buffer replaces only the line objects it actually touched, so a burst of
 * output re-renders the two or three lines that changed instead of all 2000.
 * That only holds while `palette` is referentially stable — `TerminalView`
 * memoises it for exactly this reason.
 */

/** Palette names resolve against the theme; `#rrggbb` is already literal. */
const resolve = (value, palette) => {
  if (!value) return null;
  return value.startsWith("#") ? value : (palette[value] ?? null);
};

/**
 * No bold weight of JetBrains Mono is loaded, and React Native has no
 * synthetic weights (see CLAUDE.md), so bold is rendered the way terminals did
 * it originally: by switching to the bright half of the palette.
 */
const brighten = (name) => {
  if (!name || name.startsWith("#") || name.startsWith("bright")) return name;
  return `bright${name[0].toUpperCase()}${name.slice(1)}`;
};

const segmentStyle = (seg, palette) => {
  let fg = seg.bold ? brighten(seg.fg ?? "white") : seg.fg;
  let bg = seg.bg;

  let color = resolve(fg, palette) ?? palette.foreground;
  let backgroundColor = resolve(bg, palette);

  if (seg.inverse) {
    const swapped = backgroundColor ?? palette.background;
    backgroundColor = color;
    color = swapped;
  }

  return {
    color,
    backgroundColor: backgroundColor ?? undefined,
    opacity: seg.dim ? 0.6 : undefined,
    fontStyle: seg.italic ? "italic" : undefined,
    textDecorationLine: seg.underline ? "underline" : undefined,
  };
};

const TerminalLine = memo(({ line, palette, fontSize, lineHeight }) => {
  const base = {
    fontFamily: "JetBrainsMono_400Regular",
    fontSize,
    lineHeight,
  };

  // App-generated notices are deliberately not shell colours — you must be
  // able to tell what the server said from what this app said.
  if (line.system) {
    return (
      <Text
        style={[
          base,
          { color: line.system === "error" ? palette.red : palette.brightBlack },
        ]}
      >
        {line.segments.map((seg) => seg.text).join("") || " "}
      </Text>
    );
  }

  // A blank line still needs to occupy a row, hence the space.
  if (line.segments.length === 0) {
    return <Text style={[base, { color: palette.foreground }]}> </Text>;
  }

  return (
    <Text style={[base, { color: palette.foreground }]}>
      {line.segments.map((seg, i) => (
        <Text key={i} style={segmentStyle(seg, palette)}>
          {seg.text}
        </Text>
      ))}
    </Text>
  );
});

TerminalLine.displayName = "TerminalLine";

export default TerminalLine;
