import { MoreVertical } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import InitialAvatar from "./InitialAvatar";
import StatusDot from "./StatusDot";

/**
 * One record, as a row inside the list card. This is the phone equivalent of a
 * table row — the web's five columns collapse to two lines plus trailing
 * status and menu:
 *
 *   [01] [A]  Administrator            ● ⋮
 *             Full system access
 *
 * @param {string|number} index     - 1-based; rendered mono and zero-padded
 * @param {string}        title     - primary text, gets the initial avatar
 * @param {string}        subtitle  - secondary text, truncated to one line
 * @param {string}        status    - passed to StatusDot
 * @param {boolean}       active    - overrides StatusDot's Active heuristic
 * @param {Function}      onPress   - row tap (usually opens edit)
 * @param {Function}      onMenu    - ⋮ tap; omit to hide the button
 */
const DataListRow = ({
  index,
  title,
  subtitle,
  status,
  active,
  onPress,
  onMenu,
  className,
}) => {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className={cn(
        "flex-row items-center gap-3 px-4 py-3",
        onPress && "active:bg-secondary/60",
        className,
      )}
    >
      {index != null ? (
        <Text className="text-muted-foreground font-mono text-[12px]">
          {String(index).padStart(2, "0")}
        </Text>
      ) : null}

      <InitialAvatar label={title} />

      <View className="min-w-0 flex-1">
        <Text
          className="font-sans-medium text-[14px]"
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            className="text-muted-foreground mt-0.5 text-[13px]"
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {status ? <StatusDot status={status} active={active} label={false} /> : null}

      {onMenu ? (
        <Pressable
          onPress={onMenu}
          hitSlop={10}
          accessibilityLabel="Row actions"
          className="h-8 w-8 items-center justify-center rounded-lg active:bg-secondary"
        >
          <MoreVertical size={16} color={colors.mutedForeground} />
        </Pressable>
      ) : null}
    </Pressable>
  );
};

export default DataListRow;
