import { Inbox } from "lucide-react-native";
import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

/**
 * Shown inside the list card when there are no records.
 *
 *   <EmptyState
 *     title="No items yet"
 *     message="Create your first item to get started."
 *     action={<Button …>New item</Button>}
 *   />
 */
const EmptyState = ({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  message,
  action,
  className,
}) => {
  const colors = useThemeColors();

  return (
    <View className={cn("items-center px-6 py-14", className)}>
      <View className="border-border bg-secondary h-12 w-12 items-center justify-center rounded-xl border">
        <Icon size={22} strokeWidth={1.8} color={colors.mutedForeground} />
      </View>

      <Text className="font-sans-medium mt-4 text-[15px]">{title}</Text>

      {message ? (
        <Text className="text-muted-foreground mt-1 max-w-[280px] text-center text-[13px]">
          {message}
        </Text>
      ) : null}

      {action ? <View className="mt-5">{action}</View> : null}
    </View>
  );
};

export default EmptyState;
