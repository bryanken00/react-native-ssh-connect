import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

/**
 * Segmented pill for on/off choices — use instead of a picker, which costs a
 * modal round-trip for a two-way decision.
 *
 * Controlled: pass `value` and `onChange`.
 *
 *   <StatusToggle value={status} onChange={setStatus} />
 *
 *   <StatusToggle
 *     value={visibility}
 *     onChange={setVisibility}
 *     options={[{ value: "Public" }, { value: "Private", accent: false }]}
 *   />
 *
 * @param {Array} options - [{ value, accent? }]; `accent` marks the dot green
 *                          and defaults to true for the first option only
 */
const StatusToggle = ({
  value,
  onChange,
  options = [{ value: "Active" }, { value: "Inactive" }],
  className,
}) => (
  <View
    className={cn(
      "border-border bg-secondary flex-row gap-1 rounded-xl border p-1",
      className,
    )}
  >
    {options.map((opt, i) => {
      const selected = value === opt.value;
      const accent = opt.accent ?? i === 0;

      return (
        <Pressable
          key={opt.value}
          onPress={() => onChange?.(opt.value)}
          accessibilityRole="radio"
          accessibilityState={{ selected }}
          className={cn(
            "h-10 flex-1 flex-row items-center justify-center gap-2 rounded-[9px]",
            // The selected option is a raised pill on the sunken track
            selected ? "bg-card" : "bg-transparent",
          )}
        >
          <View
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              accent ? "bg-accent" : "bg-muted-foreground",
            )}
          />
          <Text
            className={cn(
              "text-[13.5px]",
              selected
                ? "text-foreground font-sans-medium"
                : "text-muted-foreground",
            )}
          >
            {opt.value}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

export default StatusToggle;
