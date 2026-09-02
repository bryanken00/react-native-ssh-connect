import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

/**
 * Uppercase group heading with the accent tick. Used to separate form
 * sections — never a divider line.
 *
 *   <SectionLabel>Details</SectionLabel>
 */
const SectionLabel = ({ children, className }) => (
  <View className={cn("mb-4 flex-row items-center gap-2", className)}>
    <View className="bg-accent h-3.5 w-[3px] rounded-sm" />
    <Text className="text-muted-foreground font-sans-semibold text-[11px] uppercase tracking-[0.08em]">
      {children}
    </Text>
  </View>
);

export default SectionLabel;
