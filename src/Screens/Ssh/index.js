import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { FlaskConical, Moon, Plus, Server, Sun } from "lucide-react-native";
import { useCallback } from "react";
import { Alert, Pressable, View } from "react-native";
import ScreenHeader from "@/components/ScreenHeader";
import {
  DataList,
  EmptyState,
  Fab,
  FAB_CLEARANCE,
  FilterBar,
} from "@/components/pattern";
import { Text } from "@/components/ui/text";
import { SCREEN_NAVIGATION } from "@/constants/navigations";
import useAppTheme from "@/hooks/useTheme";
import { describeSshTransport } from "@/services/ssh";
import HostFormSheet from "./HostFormSheet";
import SshHostRow from "./SshHostRow";
import { useSshHosts } from "./useSshHosts";

/**
 * The app. Every saved connection, most recently used first, with the create
 * action floating over it.
 *
 * Tapping a row goes straight to the terminal — no intermediate detail screen.
 * The whole point of a saved host is one tap to a shell; editing is the
 * exception and lives behind the row's ⋮.
 *
 * There is no tab bar and no stat row. Both were removed on purpose: a tab bar
 * with one destination is decoration, and counts of your own saved hosts are
 * something you can see by looking at the list. What is left above the list is
 * the one thing you cannot infer — whether these sessions are real.
 *
 * The dark-mode toggle lives in this header because the Menu tab that used to
 * hold it is gone, and it is the app's only remaining setting.
 */
const SshHostsScreen = () => {
  const { colors, isDarkMode, toggleTheme } = useAppTheme();
  const navigation = useNavigation();
  const m = useSshHosts();

  // `lastConnectedAt` is stamped by the terminal screen, so this list's
  // ordering is stale the moment you come back from a session. `m.refresh` is
  // a stable useCallback, so this re-reads on focus and not on every render.
  const { refresh } = m;
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const transport = describeSshTransport();

  // Only the id travels in the route params. React Navigation keeps params in
  // its own state, so passing the whole row would leave a copy that goes stale
  // the moment the host is edited — and route params are the wrong place for
  // anything that has a source of truth elsewhere.
  const openTerminal = (host) =>
    navigation.navigate(SCREEN_NAVIGATION.Ssh.Terminal, {
      hostId: host.hostId,
    });

  const openRowMenu = (host) =>
    Alert.alert(host.label, `${host.username}@${host.host}:${host.port}`, [
      { text: "Edit", onPress: () => m.openEdit(host) },
      {
        text: "Delete",
        style: "destructive",
        onPress: () =>
          Alert.alert(
            "Delete connection",
            `Delete "${host.label}"? Its saved credential is removed from this device too.`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Delete",
                style: "destructive",
                onPress: () => m.remove(host.hostId),
              },
            ],
          ),
      },
      { text: "Cancel", style: "cancel" },
    ]);

  const handleSave = async (draft) => {
    try {
      await m.save(draft);
    } catch (error) {
      // A failed keychain write is the realistic case — see useSshHosts.save.
      Alert.alert("Could not save", error?.message ?? "Something went wrong.");
    }
  };

  return (
    <View className="bg-background flex-1">
      <ScreenHeader
        title="Connections"
        right={
          <Pressable
            onPress={toggleTheme}
            hitSlop={10}
            accessibilityRole="switch"
            accessibilityState={{ checked: isDarkMode }}
            accessibilityLabel={
              isDarkMode ? "Switch to light mode" : "Switch to dark mode"
            }
            className="-mr-1.5 h-9 w-9 items-center justify-center rounded-lg active:bg-secondary"
          >
            {isDarkMode ? (
              <Moon size={18} color={colors.foreground} strokeWidth={2} />
            ) : (
              <Sun size={18} color={colors.foreground} strokeWidth={2} />
            )}
          </Pressable>
        }
      />

      <DataList
        data={m.hosts}
        keyExtractor={(item) => item.hostId}
        contentContainerClassName={FAB_CLEARANCE}
        renderItem={({ item }) => (
          <SshHostRow
            host={item}
            onPress={() => openTerminal(item)}
            onMenu={() => openRowMenu(item)}
          />
        )}
        // Nothing above the list unless there is something worth saying. A
        // header that is always present just to hold padding is not.
        ListHeaderComponent={
          transport.kind === "mock" ? (
            <View className="border-border bg-card mb-5 flex-row gap-3 rounded-[14px] border p-4">
              {/* Accent bar, the same "notice" idiom as SectionLabel */}
              <View className="bg-accent w-[3px] shrink-0 rounded-sm" />
              <View className="min-w-0 flex-1">
                <View className="flex-row items-center gap-2">
                  <FlaskConical
                    size={14}
                    strokeWidth={2.2}
                    color={colors.mutedForeground}
                  />
                  <Text className="font-sans-semibold text-[13px]">
                    Sessions are simulated
                  </Text>
                </View>
                <Text className="text-muted-foreground mt-1 text-[12px] leading-relaxed">
                  {transport.reason}
                </Text>
              </View>
            </View>
          ) : null
        }
        toolbar={
          <FilterBar
            value={m.search}
            onChangeText={m.setSearch}
            placeholder="Filter by name, host or user…"
            onRefresh={m.refresh}
          />
        }
        empty={
          <EmptyState
            icon={Server}
            title={m.total === 0 ? "No connections yet" : "Nothing matches"}
            message={
              m.total === 0
                ? "Add a host and it will be one tap from a shell."
                : "Try a different name, hostname or username."
            }
          />
        }
        footer={
          <View className="border-border border-t px-4 py-3">
            <Text className="text-muted-foreground text-[12.5px]">
              {m.total === 0
                ? "No connections"
                : `${m.hosts.length} of ${m.total} ${m.total === 1 ? "connection" : "connections"}`}
            </Text>
          </View>
        }
      />

      <Fab label="Add host" icon={Plus} onPress={m.openCreate} />

      <HostFormSheet
        open={m.editing !== null}
        onClose={m.closeSheet}
        onSubmit={handleSave}
        entity={m.editing}
        saving={m.saving}
      />
    </View>
  );
};

export default SshHostsScreen;
