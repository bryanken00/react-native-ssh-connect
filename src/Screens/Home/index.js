import { Home as HomeIcon, Menu } from "lucide-react-native";
import { useState } from "react";
import { StatusBar, useWindowDimensions, View } from "react-native";
import { SceneMap, TabBar, TabBarItem, TabView } from "react-native-tab-view";
import { useThemeColors } from "@/hooks/useTheme";
import useThemeStore from "@/store/useThemeStore";
import DashboardTab from "./Dashboard";
import SettingsTab from "./Settings";

/**
 * Bottom-tab shell.
 *
 * To add a tab: write the screen, add it to `renderScene` and add a matching
 * entry to `routes` with a lucide icon component.
 */
const renderScene = SceneMap({
  dashboard: DashboardTab,
  settings: SettingsTab,
});

// Top-level destinations only. Modules belong under the Menu tab and are
// pushed onto the stack — see Screens/Home/Settings.
const routes = [
  { key: "dashboard", title: "Dashboard", icon: HomeIcon },
  { key: "settings", title: "Menu", icon: Menu },
];

const Home = () => {
  const colors = useThemeColors();
  const isDark = useThemeStore((s) => s.isDarkMode);
  const layout = useWindowDimensions();
  const [tabIndex, setTabIndex] = useState(0);

  // react-native-tab-view's TabBar takes style objects, not classNames
  const renderTabBar = (props) => (
    <TabBar
      {...props}
      activeColor={colors.primary}
      inactiveColor={colors.mutedForeground}
      indicatorStyle={{
        backgroundColor: colors.primary,
        height: 3,
        borderRadius: 3,
      }}
      style={{
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        elevation: 0,
        shadowOpacity: 0,
      }}
      renderTabBarItem={(tabProps) => {
        const { route } = tabProps;
        const Icon = route.icon;
        const isActive =
          props.navigationState.routes[props.navigationState.index].key ===
          route.key;
        return (
          <TabBarItem
            {...tabProps}
            key={route.key}
            style={{ margin: 0, padding: 0, flex: 1 }}
            labelText={
              <Icon
                size={24}
                strokeWidth={2}
                color={isActive ? colors.primary : colors.mutedForeground}
              />
            }
          />
        );
      }}
    />
  );

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      <TabView
        navigationState={{ index: tabIndex, routes }}
        renderScene={renderScene}
        onIndexChange={setTabIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
        tabBarPosition="bottom"
      />
    </View>
  );
};

export default Home;
