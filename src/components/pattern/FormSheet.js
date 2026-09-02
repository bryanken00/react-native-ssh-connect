import { X } from "lucide-react-native";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "@/components/ui/text";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

/**
 * Create / edit surface — the phone equivalent of the web's 480px right-hand
 * Drawer. A side drawer makes no sense at phone width, so this presents as a
 * full-screen modal that slides up.
 *
 * Header is accent chip + title + subtitle + bordered X, exactly as the web
 * pattern. The footer is pinned to the bottom with a hairline top border and
 * respects the home indicator.
 *
 *   <FormSheet
 *     open={open}
 *     onClose={close}
 *     icon={Package}
 *     title={isEdit ? "Edit Item" : "Create New Item"}
 *     subtitle={isEdit ? "Update item information" : "Add a new item"}
 *     footer={
 *       <>
 *         <Button variant="outline" onPress={close} className="flex-1"><Text>Cancel</Text></Button>
 *         <Button onPress={submit} disabled={!dirty} className="flex-1"><Text>Save</Text></Button>
 *       </>
 *     }
 *   >
 *     <SectionLabel>Details</SectionLabel>
 *     …fields…
 *   </FormSheet>
 */
const FormSheet = ({
  open,
  onClose,
  icon: Icon,
  title,
  subtitle,
  children,
  footer,
  contentClassName,
}) => {
  const colors = useThemeColors();
  const keyboardInset = useKeyboardInset();

  return (
    <Modal
      visible={open}
      onRequestClose={onClose}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="bg-background flex-1" edges={["top", "bottom"]}>
        {/* Android's KeyboardAvoidingView does nothing without a resizable
            window, which edge-to-edge removed — see hooks/useKeyboardInset.
            Padding here shrinks the ScrollView so the lower fields and the
            footer buttons stay reachable with the keyboard up. */}
        <KeyboardAvoidingView
          style={{
            flex: 1,
            paddingBottom: Platform.OS === "android" ? keyboardInset : 0,
          }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* ── Header ── */}
          <View className="flex-row items-start justify-between gap-3 px-5 pb-5 pt-4">
            <View className="min-w-0 flex-1 flex-row items-center gap-3">
              {Icon ? (
                <View className="bg-primary h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                  <Icon size={21} color={colors.primaryForeground} strokeWidth={2} />
                </View>
              ) : null}
              <View className="min-w-0 flex-1">
                <Text className="font-sans-semibold text-[19px] leading-tight">
                  {title}
                </Text>
                {subtitle ? (
                  <Text className="text-muted-foreground mt-0.5 text-[13px]">
                    {subtitle}
                  </Text>
                ) : null}
              </View>
            </View>

            <Pressable
              onPress={onClose}
              accessibilityLabel="Close"
              hitSlop={8}
              className="border-border h-8 w-8 shrink-0 items-center justify-center rounded-lg border active:bg-secondary"
            >
              <X size={17} color={colors.mutedForeground} />
            </Pressable>
          </View>

          {/* ── Body ── */}
          <ScrollView
            contentContainerClassName={cn("px-5 pb-6", contentClassName)}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>

          {/* ── Footer ── */}
          {footer ? (
            <View className="border-border flex-row justify-end gap-3 border-t px-5 pb-2 pt-4">
              {footer}
            </View>
          ) : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default FormSheet;
