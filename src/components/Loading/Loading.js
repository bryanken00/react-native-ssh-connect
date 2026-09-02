import { ActivityIndicator, Modal, View } from "react-native";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/useTheme";

/** Blocking modal spinner. For an inline pulse use DotsLoader. */
const Loading = ({ showDialog }) => {
  const colors = useThemeColors();

  return (
    <Modal visible={showDialog} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/50">
        <View className="border-border bg-popover flex-row items-center gap-3 rounded-2xl border px-6 py-5">
          <ActivityIndicator size={28} color={colors.primary} />
          <Text className="text-[15px] font-sans-medium">Loading, please wait…</Text>
        </View>
      </View>
    </Modal>
  );
};

export default Loading;
