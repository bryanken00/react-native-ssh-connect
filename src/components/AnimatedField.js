import { useEffect, useRef } from "react";
import { Animated } from "react-native";

/**
 * Fade + rise entrance wrapper.
 *
 * Give each sibling an increasing `delay` to stagger a form or list into view.
 * Animates once on mount and never again.
 *
 *   <AnimatedField delay={0}><Header /></AnimatedField>
 *   <AnimatedField delay={120}><Email /></AnimatedField>
 *   <AnimatedField delay={210}><Password /></AnimatedField>
 *
 * @param {number} delay    - ms before this child starts animating
 * @param {number} distance - px to rise from
 */
const AnimatedField = ({ delay = 0, distance = 18, children }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(distance)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 480,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 480,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

export default AnimatedField;
