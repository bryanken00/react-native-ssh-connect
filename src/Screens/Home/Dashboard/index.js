import { Rocket } from "lucide-react-native";
import { ScrollView, View } from "react-native";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import ScreenHeader from "@/components/ScreenHeader";
import { useThemeColors } from "@/hooks/useTheme";
import { useUserAuthStore } from "@/store/useUserAuthStore";

/**
 * Placeholder first tab — replace with your app's real home screen.
 *
 * Kept as a small worked example of docs/DESIGN_GUIDELINES.md:
 *   • colour comes from Tailwind tokens (bg-card, text-foreground), never hex
 *   • lucide icons, never emoji
 *   • content constrained with max-w-* and centred so it does not stretch
 *     edge-to-edge on a tablet
 */
const Dashboard = () => {
  const colors = useThemeColors();
  const user = useUserAuthStore((s) => s.user);

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Dashboard" />

      <ScrollView contentContainerClassName="grow justify-center p-6">
        <Card className="w-full max-w-[480px] self-center items-center p-7">
          <View className="h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
            <Rocket size={30} color={colors.primary} strokeWidth={2.2} />
          </View>

          <CardContent className="items-center p-0 pt-5">
            <Text className="text-center text-xl font-sans-bold">
              Your app starts here
            </Text>

            <Text className="text-muted-foreground mt-2.5 text-center text-sm leading-relaxed">
              Replace this screen with your first real feature. Auth, theming,
              navigation, data fetching and local storage are already wired up.
            </Text>
          </CardContent>

          {user ? (
            <View className="mt-6 w-full items-center">
              <Separator className="mb-5" />
              <Text className="text-muted-foreground text-[11px] font-sans-bold uppercase tracking-wider">
                Signed in as
              </Text>
              <Text className="mt-1 text-[15px] font-sans-semibold">
                {user.fullName || user.email || "Unknown user"}
              </Text>
            </View>
          ) : null}
        </Card>
      </ScrollView>
    </View>
  );
};

export default Dashboard;
