import { CornerDownLeft } from "lucide-react-native";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { SSH_KEYS } from "@/services/ssh";

/**
 * Where you type.
 *
 * ── Why a line editor and not a raw keyboard ────────────────────────────────
 * A desktop terminal sends every keystroke the instant you press it. A phone
 * keyboard cannot do that honestly — autocorrect rewrites words after the
 * fact, and there is no key-down event for most of it. So the input composes a
 * whole line locally and sends it on Send, which is how every mobile SSH
 * client works. Everything a shell needs that a phone keyboard has no key for
 * lives in the row above.
 *
 * Autocorrect, autocapitalise and spellcheck are all off. Left on, the first
 * `cd /etc` becomes `Cd /etc` and you spend a while working out why.
 *
 * The PTY echoes what it receives, so nothing is printed locally — see the
 * note in `useSshSession.send`.
 */

/**
 * Keys with no home on a phone keyboard, plus the punctuation a shell needs
 * constantly and iOS/Android bury two layers deep.
 */
const KEYS = [
  { label: "esc", send: SSH_KEYS.escape },
  { label: "tab", send: SSH_KEYS.tab },
  { label: "^C", send: SSH_KEYS.ctrlC, hint: "Interrupt" },
  { label: "^D", send: SSH_KEYS.ctrlD, hint: "End of input" },
  { label: "^L", send: SSH_KEYS.ctrlL, hint: "Clear screen" },
  { label: "^Z", send: SSH_KEYS.ctrlZ, hint: "Suspend" },
  { label: "↑", send: SSH_KEYS.up, hint: "Previous command" },
  { label: "↓", send: SSH_KEYS.down, hint: "Next command" },
  { label: "←", send: SSH_KEYS.left },
  { label: "→", send: SSH_KEYS.right },
];

/** Inserted into the draft line rather than sent — they are just characters. */
const GLYPHS = ["~", "/", "-", "|", "*", "$", ".", "\\"];

const KeyCap = ({ label, hint, onPress, wide }) => (
  <Pressable
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={hint ?? label}
    className={cn(
      "border-border bg-secondary h-9 items-center justify-center rounded-lg border active:opacity-60",
      wide ? "px-3" : "min-w-9 px-2.5",
    )}
  >
    <Text className="text-foreground font-mono text-[12.5px]">{label}</Text>
  </Pressable>
);

const TerminalInputBar = ({ onSend, onSendKey, disabled = false }) => {
  const colors = useThemeColors();
  const [draft, setDraft] = useState("");

  const submit = useCallback(() => {
    if (disabled) return;
    // An empty submit is meaningful — it is how you get a fresh prompt.
    onSend(draft);
    setDraft("");
  }, [disabled, draft, onSend]);

  return (
    <View className="border-border bg-card border-t">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        contentContainerClassName="gap-1.5 px-3 py-2"
      >
        {KEYS.map((key) => (
          <KeyCap
            key={key.label}
            label={key.label}
            hint={key.hint}
            onPress={() => !disabled && onSendKey(key.send)}
          />
        ))}

        {/* Hairline break: everything left of it is a key, right of it a character */}
        <View className="bg-border mx-1 w-px self-stretch" />

        {GLYPHS.map((glyph) => (
          <KeyCap
            key={glyph}
            label={glyph}
            hint={`Insert ${glyph}`}
            onPress={() => setDraft((d) => d + glyph)}
          />
        ))}
      </ScrollView>

      <View className="border-border flex-row items-center gap-2 border-t px-3 py-2.5">
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={submit}
          editable={!disabled}
          placeholder={disabled ? "Not connected" : "Type a command…"}
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
          returnKeyType="send"
          // Keep the keyboard up between commands — closing it after every
          // line makes the terminal unusable.
          submitBehavior="submit"
          accessibilityLabel="Command input"
          className={cn(
            "border-input bg-background text-foreground h-11 min-w-0 flex-1 rounded-lg border px-3 font-mono text-[13px]",
            disabled && "opacity-50",
          )}
        />

        <Pressable
          onPress={submit}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel="Send command"
          className={cn(
            "bg-primary h-11 w-11 items-center justify-center rounded-lg active:opacity-90",
            disabled && "opacity-50",
          )}
        >
          <CornerDownLeft
            size={17}
            color={colors.primaryForeground}
            strokeWidth={2.2}
          />
        </Pressable>
      </View>
    </View>
  );
};

export default TerminalInputBar;
