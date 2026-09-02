import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

/**
 * Inline "…" pulse, for use next to a label inside a busy button.
 *
 *   <Text>Signing in</Text>
 *   <DotsLoader color={colors.onPrimary} />
 *
 * For a full-screen spinner use LoadingScreen; for a blocking modal use Loading.
 *
 * @param {string} color - dot color, usually the container's foreground token
 * @param {number} size  - font size of each dot
 * @param {number} count - number of dots; read once on mount
 */
const DotsLoader = ({ color, size = 15.5, count = 3 }) => {
  // One ref holding N values — NOT N useRef calls inside a map, which would
  // break the rules of hooks.
  const dots = useRef(
    Array.from({ length: count }, () => new Animated.Value(0)),
  ).current;

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={{ flexDirection: "row", marginLeft: 6 }}>
      {dots.map((dot, i) => (
        <Animated.Text
          key={i}
          style={{
            fontSize: size,
            fontWeight: "700",
            letterSpacing: 0.3,
            color,
            opacity: dot.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1],
            }),
          }}
        >
          .
        </Animated.Text>
      ))}
    </View>
  );
};

export default DotsLoader;
