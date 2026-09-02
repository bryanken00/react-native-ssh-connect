import { ChevronLeft } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

/**
 * The app's only header idiom: a fixed bar with an optional back button, the
 * screen title, and an optional trailing slot.
 *
 * Every screen uses this — tabs, modules, detail screens — so the title stays
 * in the same place and at the same size throughout the app.
 *
 *   <ScreenHeader title="Menu" />
 *   <ScreenHeader title="Items" onBack={navigation.goBack} />
 *   <ScreenHeader title="Items" onBack={navigation.goBack} right={<Button …/>} />
 *
 * The navigator runs with `headerShown: false`, so on a pushed screen `onBack`
 * is the only way back.
 *
 * @param {Function}        onBack - omit on tab screens, pass on pushed ones
 * @param {React.ReactNode} left   - replaces the back button entirely
 * @param {React.ReactNode} right  - trailing actions
 */
const ScreenHeader = ({ title, onBack, left, right, className }) => {
  const colors = useThemeColors();

  return (
    <View
      className={cn(
        "border-border bg-card h-14 flex-row items-center gap-3 border-b px-4",
        className,
      )}
    >
      {left ??
        (onBack ? (
          <Pressable
            onPress={onBack}
            accessibilityLabel="Go back"
            hitSlop={10}
            className="-ml-1.5 h-9 w-9 items-center justify-center rounded-lg active:bg-secondary"
          >
            <ChevronLeft size={20} color={colors.foreground} />
          </Pressable>
        ) : null)}

      <Text
        className="font-sans-semibold flex-1 text-[19px]"
        numberOfLines={1}
      >
        {title}
      </Text>

      {right}
    </View>
  );
};

export default ScreenHeader;
