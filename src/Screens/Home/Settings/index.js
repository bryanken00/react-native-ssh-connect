import { useNavigation } from "@react-navigation/native";
import { LogOut, Moon, Package, Sun } from "lucide-react-native";
import { useMemo } from "react";
import { Alert, ScrollView, View } from "react-native";
import GroupedList from "@/components/GroupedList";
import ScreenHeader from "@/components/ScreenHeader";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Text } from "@/components/ui/text";
import { SCREEN_NAVIGATION } from "@/constants/navigations";
import useAppTheme from "@/hooks/useTheme";
import { useLogout } from "@/services/requests/auth";

const SettingsTab = () => {
  const navigation = useNavigation();
  const { colors, isDarkMode, toggleTheme } = useAppTheme();
  const { mutate: logout, isPending: loggingOut } = useLogout();

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => logout() },
    ]);
  };

  // Modules live here rather than in the tab bar — the tab bar is for
  // top-level destinations only. Add a row per module, register the screen in
  // src/Navigation/index.js, and name the route in constants/navigations.js.
  const sections = useMemo(
    () => [
      {
        title: "Modules",
        items: [
          {
            title: "Items",
            description: "Manage the items in your catalogue",
            icon: Package,
            onPress: () =>
              navigation.navigate(SCREEN_NAVIGATION.Modules.Items),
          },
        ],
      },
      {
        title: "Preferences",
        items: [
          {
            title: "Dark Mode",
            description: `Currently using ${isDarkMode ? "dark" : "light"} theme`,
            icon: isDarkMode ? Moon : Sun,
            right: (
              <Switch checked={isDarkMode} onCheckedChange={toggleTheme} />
            ),
          },
        ],
      },
    ],
    [isDarkMode, toggleTheme, navigation],
  );

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader title="Menu" />

      <ScrollView
        contentContainerClassName="p-4 pb-10"
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section) => (
          <GroupedList
            key={section.title}
            title={section.title}
            items={section.items}
          />
        ))}

        <Button
          variant="outline"
          onPress={handleLogout}
          disabled={loggingOut}
          className="border-destructive bg-destructive/10 mb-4 mt-2 h-14 flex-row gap-2.5"
        >
          <LogOut size={18} color={colors.destructive} strokeWidth={2} />
          <Text className="text-destructive text-[15px] font-sans-semibold">
            {loggingOut ? "Signing out…" : "Sign Out"}
          </Text>
        </Button>
      </ScrollView>
    </View>
  );
};

export default SettingsTab;
