import { AlertCircle, CheckCircle, XCircle } from "lucide-react-native";
import { Modal, Pressable, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";

/** Dialog intents. Re-exported from hooks/useCustomDialog for convenience. */
export const CUSTOMDIALOGSTATUS = {
  success: "success",
  warning: "warning",
  error: "error",
};

// Fixed status colors per docs/DESIGN_GUIDELINES.md — the token set has no
// semantic success/warning role, and these must read the same in both themes.
const STATUS_ICON = {
  [CUSTOMDIALOGSTATUS.success]: { Icon: CheckCircle, color: "#2E7D32" },
  [CUSTOMDIALOGSTATUS.warning]: { Icon: AlertCircle, color: "#E65100" },
  [CUSTOMDIALOGSTATUS.error]: { Icon: XCircle, color: "#E53935" },
};

/**
 * Confirmation dialog. Presentational only — it holds no state.
 *
 * You normally do not render this yourself: `CustomDialogProvider` mounts one
 * and `useCustomDialog()` opens it. Render it directly only if you want a
 * dialog whose state you own.
 */
const CustomDialog = ({
  visible = true,
  onClose,
  onConfirm,
  title = "Confirmation",
  message = "Are you sure you want to confirm?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  showCancel = true,
  showConfirm = true,
  status = CUSTOMDIALOGSTATUS.warning,
  allowClickOutside = true,
}) => {
  const { Icon, color } = STATUS_ICON[status] ?? STATUS_ICON.warning;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable
        className="absolute inset-0 bg-black/50"
        onPress={allowClickOutside ? onClose : undefined}
      />

      <View className="flex-1 items-center justify-center" pointerEvents="box-none">
        <View className="border-border bg-popover w-[90%] max-w-[420px] rounded-2xl border p-5">
          <View className="flex-row items-center gap-2.5">
            <Icon size={28} color={color} />
            <Text className="flex-1 text-base font-sans-semibold">{title}</Text>
          </View>

          <Text className="text-muted-foreground ml-[38px] mt-2 text-sm leading-relaxed">
            {message}
          </Text>

          <View className="mt-5 flex-row justify-end gap-2.5">
            {/* Conditional rendering, not a `display` style — React Native has
                no "block" value, so the original ternary never actually hid
                anything. */}
            {showCancel ? (
              <Button
                variant="outline"
                onPress={onClose}
                className="max-w-[150px] flex-1"
              >
                <Text>{cancelText}</Text>
              </Button>
            ) : null}

            {showConfirm ? (
              <Button onPress={onConfirm} className="max-w-[150px] flex-1">
                <Text>{confirmText}</Text>
              </Button>
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomDialog;
