import { ChevronRight } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

/**
 * iOS-style grouped list: an uppercase section header above a rounded card of
 * rows, hairline-divided.
 *
 * Each item is `{ title, description, icon, onPress, right }`:
 *   • `icon`     lucide icon component (not an element, not a string)
 *   • `onPress`  makes the row tappable and shows a chevron
 *   • `right`    replaces the chevron with your own control (Switch, Badge…);
 *                a row with `right` and no `onPress` is not pressable
 *
 *   <GroupedList
 *     title="Preferences"
 *     items={[
 *       { title: "Profile", description: "Name and photo", icon: User,
 *         onPress: () => navigate(SCREEN_NAVIGATION.Profile) },
 *       { title: "Dark Mode", icon: Moon,
 *         right: <Switch checked={isDark} onCheckedChange={toggle} /> },
 *     ]}
 *   />
 */
const GroupedList = ({ title, items, className }) => {
  const colors = useThemeColors();

  return (
    <View className={cn("mb-6", className)}>
      {title ? (
        <Text className="text-muted-foreground mb-1.5 px-1 text-[11px] font-sans-bold uppercase tracking-wider">
          {title}
        </Text>
      ) : null}

      <View className="border-border bg-card overflow-hidden rounded-xl border">
        {items.map((item, index) => {
          const Icon = item.icon;
          const Row = item.onPress ? Pressable : View;

          return (
            <View key={item.title}>
              <Row
                onPress={item.onPress}
                className={cn(
                  "flex-row items-center gap-3 px-4 py-3",
                  item.onPress && "active:bg-secondary/50",
                )}
              >
                {Icon ? (
                  <Icon size={20} color={colors.primary} strokeWidth={2} />
                ) : null}

                <View className="flex-1">
                  <Text className="text-[15px] font-sans-semibold">{item.title}</Text>
                  {item.description ? (
                    <Text className="text-muted-foreground text-xs">
                      {item.description}
                    </Text>
                  ) : null}
                </View>

                {item.right ??
                  (item.onPress ? (
                    <ChevronRight
                      size={18}
                      color={colors.mutedForeground}
                      strokeWidth={2}
                    />
                  ) : null)}
              </Row>

              {index < items.length - 1 && <Separator className="ml-4" />}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default GroupedList;
