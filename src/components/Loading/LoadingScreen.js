import { View } from "react-native";
import { SkypeIndicator } from "react-native-indicators";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

/** Full-screen spinner. For a blocking modal use Loading. */
const LoadingScreen = ({ color, size = 70, className }) => {
  const colors = useThemeColors();

  return (
    <View className={cn("flex-1 items-center justify-center", className)}>
      <SkypeIndicator color={color || colors.primary} size={size} />
    </View>
  );
};

export default LoadingScreen;
