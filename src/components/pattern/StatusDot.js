import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

/**
 * Small filled dot + label. Active gets the accent green and a soft glow;
 * anything else is muted.
 *
 *   <StatusDot status="Active" />
 *   <StatusDot status="Archived" active={false} />
 *
 * `active` defaults to `status === "Active"`. Pass it explicitly when your
 * vocabulary differs ("Enabled", "Published", …).
 */
const StatusDot = ({ status, active, label = true, className }) => {
  const isActive = active ?? status === "Active";

  return (
    <View className={cn("flex-row items-center gap-2", className)}>
      <View
        className={cn(
          "h-[7px] w-[7px] rounded-full",
          isActive ? "bg-accent" : "bg-muted-foreground",
        )}
        // Glow is decorative and only meaningful on the active state
        style={
          isActive
            ? {
                shadowColor: "#22c55e",
                shadowOpacity: 0.5,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 0 },
                elevation: 0,
              }
            : undefined
        }
      />
      {label ? (
        <Text className="text-muted-foreground text-[13px]">{status}</Text>
      ) : null}
    </View>
  );
};

export default StatusDot;
