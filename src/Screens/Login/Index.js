import {
  ArrowRight,
  Eye,
  EyeOff,
  FlaskConical,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AnimatedField from "@/components/AnimatedField";
import DotsLoader from "@/components/Loading/DotsLoader";
import LogoMark from "@/components/LogoMark";
import StyledInput from "@/components/StyledInput";
import { Text } from "@/components/ui/text";
import { IS_DEMO } from "@/constants";
import { useThemeColors } from "@/hooks/useTheme";
import { useLoginAuth } from "@/services/requests/auth";
import useThemeStore from "@/store/useThemeStore";
import { isValidEmail } from "@/utils/regex";

/**
 * Reference implementation for docs/DESIGN_GUIDELINES.md.
 *
 * The reusable pieces live in src/components — LogoMark, AnimatedField,
 * StyledInput and DotsLoader. What stays here is only the login screen itself:
 * layout, form state and submit.
 */
const Login = () => {
  const { mutate, isPending } = useLoginAuth();
  const colors = useThemeColors();
  // The store owns the toggle; classes handle the palette.
  const isDark = useThemeStore((s) => s.isDarkMode);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // "Touched" gates the error message so the field does not turn red while
  // someone is still typing the first character. Set on blur, and on a failed
  // submit so tapping Sign In on an empty form still explains itself.
  const [touched, setTouched] = useState({ email: false, password: false });
  const touch = (field) =>
    setTouched((t) => (t[field] ? t : { ...t, [field]: true }));

  const passwordRef = useRef(null);

  // Logo entrance
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Button press
  const btnScale = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(btnScale, { toValue: 0.97, useNativeDriver: true }).start();
  const onPressOut = () =>
    Animated.spring(btnScale, { toValue: 1, useNativeDriver: true }).start();

  // ── Validation ─────────────────────────────────────────────────────────────
  // Computed every render rather than stored, so the state cannot go stale.
  const trimmedEmail = email.trim();

  const emailError = !trimmedEmail
    ? "Email address is required."
    : !isValidEmail(trimmedEmail)
      ? "Enter a valid email address."
      : null;

  const passwordError = !password ? "Password is required." : null;

  const canSubmit = !emailError && !passwordError && !isPending;

  const handleLogin = () => {
    Keyboard.dismiss();
    if (!canSubmit) {
      // Reveal whatever is wrong instead of failing silently
      setTouched({ email: true, password: true });
      return;
    }
    mutate({ email: trimmedEmail, password });
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      {/* ── Decorative blobs ── */}
      <View className="bg-secondary absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-50" />
      <View className="bg-accent absolute -bottom-20 -left-20 h-56 w-56 rounded-full opacity-45" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerClassName="grow justify-center items-center p-6"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="border-border bg-card w-full max-w-[440px] rounded-3xl border p-7">
            {/* ── Header ── */}
            <Animated.View
              className="mb-7 items-center"
              style={{
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              }}
            >
              <LogoMark />
              <Text className="mt-[18px] text-[26px] font-sans-bold tracking-tight">
                Welcome back
              </Text>
              <Text className="text-muted-foreground mt-1.5 text-sm">
                Sign in to continue
              </Text>

              {IS_DEMO ? (
                <View className="mt-3.5 flex-row items-center gap-1.5 rounded-full bg-[#FFF3E0] px-3 py-1.5">
                  <FlaskConical size={13} color="#E65100" strokeWidth={2.2} />
                  <Text className="text-[11.5px] font-sans-bold text-[#E65100]">
                    Demo mode · any valid email and password works
                  </Text>
                </View>
              ) : null}
            </Animated.View>

            {/* ── Email ── */}
            <AnimatedField delay={120}>
              <StyledInput
                label="Email address"
                value={email}
                onChangeText={setEmail}
                onBlur={() => touch("email")}
                error={touched.email ? emailError : null}
                placeholder="you@company.com"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                Icon={Mail}
              />
            </AnimatedField>

            {/* ── Password ── */}
            <AnimatedField delay={210}>
              <StyledInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                onBlur={() => touch("password")}
                error={touched.password ? passwordError : null}
                placeholder="Enter your password"
                secureTextEntry={!showPass}
                autoComplete="current-password"
                textContentType="password"
                inputRef={passwordRef}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                Icon={Lock}
                rightElement={
                  <TouchableOpacity
                    onPress={() => setShowPass((v) => !v)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    {showPass ? (
                      <EyeOff
                        size={19}
                        color={colors.mutedForeground}
                        strokeWidth={2}
                      />
                    ) : (
                      <Eye
                        size={19}
                        color={colors.mutedForeground}
                        strokeWidth={2}
                      />
                    )}
                  </TouchableOpacity>
                }
              />
            </AnimatedField>

            {/* ── Forgot password ── */}
            <AnimatedField delay={290}>
              <TouchableOpacity
                className="-mt-0.5 mb-5 items-end"
                activeOpacity={0.7}
              >
                <Text className="text-primary text-[13px] font-sans-semibold">
                  Forgot password?
                </Text>
              </TouchableOpacity>
            </AnimatedField>

            {/* ── Submit ── */}
            <AnimatedField delay={370}>
              {/* Pressable while invalid on purpose: a dead button explains
                  nothing. Tapping it surfaces the errors via handleLogin.
                  Only a request in flight actually blocks the press. */}
              <Pressable
                onPressIn={onPressIn}
                onPressOut={onPressOut}
                onPress={handleLogin}
                disabled={isPending}
                accessibilityRole="button"
                accessibilityState={{ disabled: !canSubmit, busy: isPending }}
              >
                <Animated.View
                  className={cnBtn(canSubmit)}
                  style={{ transform: [{ scale: btnScale }] }}
                >
                  {isPending ? (
                    <View className="flex-row items-center gap-2">
                      <Text className="text-primary-foreground text-[15.5px] font-sans-bold">
                        Signing in
                      </Text>
                      <DotsLoader color={colors.primaryForeground} />
                    </View>
                  ) : (
                    <View className="flex-row items-center gap-2">
                      <Text
                        className={
                          canSubmit
                            ? "text-primary-foreground text-[15.5px] font-sans-bold"
                            : "text-muted-foreground text-[15.5px] font-sans-bold"
                        }
                      >
                        Sign In
                      </Text>
                      <ArrowRight
                        size={19}
                        strokeWidth={2.4}
                        color={
                          canSubmit
                            ? colors.primaryForeground
                            : colors.mutedForeground
                        }
                      />
                    </View>
                  )}
                </Animated.View>
              </Pressable>
            </AnimatedField>

            {/* ── Footer ── */}
            <AnimatedField delay={450}>
              <View className="mt-5 flex-row items-center justify-center gap-1.5">
                <ShieldCheck
                  size={13}
                  color={colors.mutedForeground}
                  strokeWidth={2}
                />
                <Text className="text-muted-foreground text-[11.5px]">
                  Secure access · Encrypted in transit
                </Text>
              </View>
            </AnimatedField>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/** Submit button surface — disabled state drops the brand fill and shadow. */
const cnBtn = (enabled) =>
  [
    "h-[54px] flex-row items-center justify-center rounded-lg",
    enabled ? "bg-primary" : "bg-muted",
  ].join(" ");

export default Login;
