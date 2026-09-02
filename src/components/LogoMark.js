import { Sparkles } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

/**
 * Rounded-square brand mark: a primary→accent gradient plate with an icon.
 *
 * This is the placeholder identity — swap the icon, or replace the whole
 * component with your own artwork. The app icons in assets/ use the same
 * gradient and glyph, so change both together.
 *
 * Uses `useThemeColors` rather than classes because react-native-svg gradient
 * stops take colour strings, not Tailwind classes.
 *
 *   <LogoMark />
 *   <LogoMark icon={Rocket} size={48} />
 */
const LogoMark = ({ icon: Icon = Sparkles, size = 64, className }) => {
  const colors = useThemeColors();
  const radius = size * 0.28;

  return (
    <View
      className={cn("items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.primary} />
            <Stop offset="1" stopColor={colors.accentForeground} />
          </LinearGradient>
        </Defs>
        <Rect width={size} height={size} rx={radius} fill="url(#logoGrad)" />
      </Svg>
      {/* White reads correctly on the brand gradient in both themes */}
      <Icon size={size * 0.47} color="#fff" strokeWidth={2.2} />
    </View>
  );
};

export default LogoMark;
