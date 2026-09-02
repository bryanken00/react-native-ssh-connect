import { useState } from "react";
import { View } from "react-native";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

/**
 * Labelled text input with a leading icon, a focus ring and an error state.
 *
 * Wraps RNR's `Input` to add the label, icon slot and trailing element. For a
 * plain field with no decoration, use `Input` directly.
 *
 *   <StyledInput
 *     label="Email address"
 *     value={email}
 *     onChangeText={setEmail}
 *     onBlur={() => setTouched(true)}
 *     error={touched && !isValidEmail(email) ? "Enter a valid email" : null}
 *     Icon={Mail}
 *   />
 *
 * @param {React.ComponentType} Icon         - lucide icon component (not an element)
 * @param {React.ReactNode}     rightElement - optional trailing control
 * @param {object}              inputRef     - ref to the TextInput, for focus chaining
 * @param {string}              error        - message to show; also reddens the border
 */
const StyledInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize = "none",
  autoComplete,
  textContentType,
  secureTextEntry,
  Icon,
  rightElement,
  onFocus,
  onBlur,
  onSubmitEditing,
  returnKeyType,
  inputRef,
  error,
  className,
}) => {
  const colors = useThemeColors();
  const [focused, setFocused] = useState(false);

  const hasError = Boolean(error);

  // Error wins over focus, so a bad value stays visibly bad while being edited
  const accent = hasError
    ? colors.destructive
    : focused || value
      ? colors.primary
      : colors.mutedForeground;

  return (
    <View className={cn("mb-4", className)}>
      {label ? (
        <Text className="text-muted-foreground font-sans-medium mb-1.5 ml-0.5 text-[13px]">
          {label}
        </Text>
      ) : null}

      <View
        className={cn(
          "h-[54px] flex-row items-center gap-3 rounded-lg border px-4",
          hasError
            ? "border-destructive bg-destructive/5"
            : focused
              ? "border-primary bg-secondary/40"
              : "border-border bg-muted/40",
        )}
      >
        {Icon ? <Icon size={19} color={accent} strokeWidth={2} /> : null}

        <Input
          ref={inputRef}
          className="native:h-full h-full flex-1 border-0 bg-transparent px-0 text-[15px]"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          textContentType={textContentType}
          autoCorrect={false}
          secureTextEntry={secureTextEntry}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          accessibilityInvalid={hasError}
        />

        {rightElement}
      </View>

      {hasError ? (
        <Text className="text-destructive mt-1.5 ml-0.5 text-[12.5px]">
          {error}
        </Text>
      ) : null}
    </View>
  );
};

export default StyledInput;
