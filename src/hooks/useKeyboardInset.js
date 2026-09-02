import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * How far content must lift so the keyboard does not cover it, in px.
 *
 * ── Why this exists rather than just KeyboardAvoidingView ───────────────────
 * `<KeyboardAvoidingView behavior={undefined}>` — which is what every
 * `Platform.OS === "ios" ? "padding" : undefined` ends up as on Android — does
 * **nothing at all**. It is not a lighter mode; there is no mode. It renders a
 * plain View and leaves the work to the Android window manager's
 * `adjustResize`, which shrinks the window when the keyboard opens.
 *
 * That worked for years. It stopped working when Android went edge-to-edge
 * (the default since SDK 54): the app now draws behind the system bars, the
 * window is already full-screen, and `adjustResize` has nothing left to
 * resize. The keyboard simply slides over the layout, and a bottom-anchored
 * input disappears under it.
 *
 * So the height is measured directly and applied as padding.
 *
 * ── The inset subtraction ───────────────────────────────────────────────────
 * `endCoordinates.height` is measured from the bottom of the **screen**, but
 * content sits above the safe-area inset — the home indicator on iOS, the
 * gesture bar on Android. Padding by the raw height would lift everything by
 * that inset too, leaving a visible gap above the keyboard. Hence the
 * subtraction, floored at 0 for the case where the inset is larger.
 *
 * ── Events ──────────────────────────────────────────────────────────────────
 * iOS gets `keyboardWillShow`, which fires as the slide begins so the layout
 * moves with it. Android only emits `keyboardDidShow` reliably, so it lands a
 * frame later — correct, marginally less smooth, and not something a JS-side
 * fix can improve without a native module.
 *
 *   const keyboardInset = useKeyboardInset();
 *   <View style={{ flex: 1, paddingBottom: keyboardInset }}>
 *
 * @returns {number} px to lift; 0 when the keyboard is closed
 */
export const useKeyboardInset = () => {
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const show = Keyboard.addListener(showEvent, (event) =>
      setKeyboardHeight(event.endCoordinates?.height ?? 0),
    );
    const hide = Keyboard.addListener(hideEvent, () => setKeyboardHeight(0));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (keyboardHeight === 0) return 0;
  return Math.max(0, keyboardHeight - insets.bottom);
};

export default useKeyboardInset;
