import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

/**
 * Floating create action, pinned bottom-right above the list.
 *
 * Flat by design — the Modern system bans shadows, so this reads as a raised
 * surface through the inverted `primary` fill and a hairline ring rather than
 * elevation.
 *
 *   <Fab label="New item" icon={Plus} onPress={openCreate} />
 *   <Fab icon={Plus} onPress={openCreate} />            // icon-only
 *
 * ⚠️ It floats over the list, so the scroll content must reserve room or the
 * FAB will sit on top of the last row and the pager. Use `FAB_CLEARANCE` on
 * the list's contentContainerClassName:
 *
 *   <DataList contentContainerClassName={FAB_CLEARANCE} … />
 */

/** Bottom padding a scroll view needs so its last content clears the FAB. */
export const FAB_CLEARANCE = "pb-28";

const Fab = ({ label, icon: Icon, onPress, className }) => {
  const colors = useThemeColors();
  const iconOnly = !label;

  return (
    // pointerEvents box-none so the wrapper never blocks taps on the list
    <View
      className="absolute bottom-5 right-4"
      pointerEvents="box-none"
      accessibilityViewIsModal={false}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label ?? "Create"}
        className={cn(
          "bg-primary border-border/40 flex-row items-center justify-center gap-2 border active:opacity-90",
          iconOnly ? "h-14 w-14 rounded-full" : "h-13 rounded-full px-5 py-4",
          className,
        )}
      >
        {Icon ? (
          <Icon size={19} color={colors.primaryForeground} strokeWidth={2.4} />
        ) : null}
        {label ? (
          <Text className="text-primary-foreground font-sans-semibold text-[14.5px]">
            {label}
          </Text>
        ) : null}
      </Pressable>
    </View>
  );
};

export default Fab;
