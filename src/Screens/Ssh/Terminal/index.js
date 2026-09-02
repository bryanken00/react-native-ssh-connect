import { useNavigation, useRoute } from "@react-navigation/native";
import { MoreVertical, RotateCw, ServerOff } from "lucide-react-native";
import { useMemo } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, View } from "react-native";
import ScreenHeader from "@/components/ScreenHeader";
import { EmptyState, StatusDot } from "@/components/pattern";
import TerminalInputBar from "@/components/terminal/TerminalInputBar";
import TerminalView from "@/components/terminal/TerminalView";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useKeyboardInset } from "@/hooks/useKeyboardInset";
import { useThemeColors } from "@/hooks/useTheme";
import { useSshSession } from "@/hooks/useSshSession";
import { db_getSshHostById } from "@/store/database/endpoints/ssh.endpoints";

/**
 * The shell.
 *
 * Layout is fixed header → scrollback → input bar, with the input bar riding
 * above the keyboard. The scrollback is the only part that scrolls; the header
 * and the key row stay reachable while a command is running.
 *
 * Connection state is never hidden. It shows three ways at once, because each
 * catches a different reader: a dot and word in the header, the app's own
 * lines in the scrollback ("Connecting to…", the failure reason), and the
 * bottom bar swapping from input to a reconnect panel once there is nothing
 * left to type into.
 */

const STATUS_LABEL = {
  connecting: "Connecting",
  connected: "Connected",
  error: "Failed",
  closed: "Closed",
};

/**
 * "Connected" is a lie when the session is the mock, and it is the single most
 * reassuring word on the screen — it sits next to a green dot at the top of a
 * terminal that is echoing a fake Ubuntu banner. Say "Simulated" instead, and
 * keep the green dot for connections that actually reached a server.
 */
const statusFor = (status, transport) => {
  if (status === "connected" && transport.kind === "mock") {
    return { label: "Simulated", live: false };
  }
  return { label: STATUS_LABEL[status], live: status === "connected" };
};

const TerminalScreen = () => {
  const navigation = useNavigation();
  const { hostId } = useRoute().params ?? {};

  // Read the row here rather than accepting it as a param — see the note at
  // the navigate call in Screens/Ssh/index.js.
  const host = useMemo(() => db_getSshHostById(hostId), [hostId]);

  if (!host) {
    return (
      <View className="bg-background flex-1">
        <ScreenHeader title="Terminal" onBack={navigation.goBack} />
        <EmptyState
          icon={ServerOff}
          title="Connection not found"
          message="It was deleted, or this screen was restored after the app was reinstalled."
          action={
            <Button variant="outline" onPress={navigation.goBack}>
              <Text>Back to connections</Text>
            </Button>
          }
        />
      </View>
    );
  }

  return <TerminalSession host={host} />;
};

/**
 * Split out so `useSshSession` is only ever mounted with a real host — a hook
 * cannot sit behind the early return above.
 */
const TerminalSession = ({ host }) => {
  const colors = useThemeColors();
  const navigation = useNavigation();
  const session = useSshSession(host);
  const keyboardInset = useKeyboardInset();

  // `live` gates behaviour — can you type, is there a session to hang up.
  // `badge` is what the header claims, which is not the same thing: a mock
  // session is fully usable but must never present as a real connection.
  const live = session.status === "connected";
  const badge = statusFor(session.status, session.transport);
  const canReconnect = session.status === "error" || session.status === "closed";

  const openMenu = () =>
    Alert.alert(host.label, `${host.username}@${host.host}:${host.port}`, [
      { text: "Clear screen", onPress: session.clear },
      {
        text: live ? "Disconnect" : "Reconnect",
        style: live ? "destructive" : "default",
        onPress: live ? session.disconnect : session.reconnect,
      },
      { text: "Cancel", style: "cancel" },
    ]);

  return (
    <View className="bg-background flex-1">
      <ScreenHeader
        title={host.label}
        onBack={navigation.goBack}
        right={
          <View className="flex-row items-center gap-2">
            {/* Green dot only for a connection that reached a real server.
                Connecting is neither on nor off; the word carries it. */}
            <StatusDot status={badge.label} active={badge.live} />
            <Pressable
              onPress={openMenu}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Session actions"
              className="-mr-1.5 h-9 w-9 items-center justify-center rounded-lg active:bg-secondary"
            >
              <MoreVertical size={18} color={colors.foreground} />
            </Pressable>
          </View>
        }
      />

      {/* iOS: KeyboardAvoidingView's `padding` genuinely works, and moves in
          step with the keyboard animation. Android: it is a no-op, so the
          measured inset is applied directly — see useKeyboardInset. */}
      <KeyboardAvoidingView
        style={{
          flex: 1,
          paddingBottom: Platform.OS === "android" ? keyboardInset : 0,
        }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TerminalView lines={session.lines} />

        {canReconnect ? (
          <View className="border-border bg-card gap-3 border-t px-4 py-4">
            <Text
              className="text-muted-foreground text-[12.5px] leading-relaxed"
              numberOfLines={3}
            >
              {session.error ?? "The session ended."}
            </Text>
            <View className="flex-row gap-3">
              <Button
                variant="outline"
                onPress={navigation.goBack}
                className="h-12 flex-1"
              >
                <Text>Back</Text>
              </Button>
              <Button onPress={session.reconnect} className="h-12 flex-1 gap-2">
                <RotateCw size={16} color={colors.primaryForeground} strokeWidth={2.2} />
                <Text>Reconnect</Text>
              </Button>
            </View>
          </View>
        ) : (
          <TerminalInputBar
            onSend={session.sendLine}
            onSendKey={session.sendKey}
            disabled={!live}
          />
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

export default TerminalScreen;
