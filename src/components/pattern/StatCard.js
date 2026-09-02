import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

/**
 * Label + dim icon on one line, then a large value with an optional unit, then
 * a caption. Hairline border, no shadow.
 *
 *   <StatCard title="Total items" value={12} change="all time" icon={Package} />
 *
 * On a phone these stack two-up rather than the web's three columns — pass
 * `className="flex-1"` and wrap in a `flex-row gap-3`.
 *
 * @param {React.ComponentType} icon - lucide component, rendered muted
 * @param {string}              unit - small suffix after the value, e.g. "kg"
 */
const StatCard = ({ title, value, change, unit, icon: Icon, className }) => {
  const colors = useThemeColors();

  return (
    <View
      className={cn(
        "border-border bg-card rounded-[14px] border p-4",
        className,
      )}
    >
      <View className="flex-row items-center justify-between gap-2">
        <Text
          className="text-muted-foreground font-sans-medium text-[12.5px]"
          numberOfLines={1}
        >
          {title}
        </Text>
        {Icon ? (
          <Icon size={17} strokeWidth={1.8} color={colors.mutedForeground} />
        ) : null}
      </View>

      <View className="mt-2.5 flex-row items-baseline gap-1">
        <Text className="font-sans-semibold text-[26px] leading-none">
          {value}
        </Text>
        {unit ? (
          <Text className="text-muted-foreground font-mono text-[12px]">
            {unit}
          </Text>
        ) : null}
      </View>

      {change ? (
        <Text className="text-muted-foreground mt-1.5 text-[11.5px]">
          {change}
        </Text>
      ) : null}
    </View>
  );
};

export default StatCard;
