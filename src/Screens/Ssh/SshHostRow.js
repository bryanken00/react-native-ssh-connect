import { ChevronRight, KeyRound, Lock, MoreVertical } from "lucide-react-native";
import { memo } from "react";
import { Pressable, View } from "react-native";
import { InitialAvatar } from "@/components/pattern";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/useTheme";
import { formatRelativeTime } from "@/utils/dateFormat";

/**
 * One saved connection.
 *
 * `DataListRow` is the pattern's row and would nearly fit, but a host has
 * three things worth showing at a glance — where it is, how it authenticates,
 * and when you last used it — and that row has one subtitle slot. Per §1 of
 * the engineering checklist this is used once, so it lives here beside its
 * screen rather than being extracted into `components/pattern/`.
 *
 *   [A]  Production API                        2h ago
 *        deploy@10.0.0.4:22    🔑 key           ›  ⋮
 */
const SshHostRow = memo(({ host, onPress, onMenu }) => {
  const colors = useThemeColors();
  const usingKey = host.authType === "key";
  const AuthIcon = usingKey ? KeyRound : Lock;
  const lastUsed = formatRelativeTime(host.lastConnectedAt);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Connect to ${host.label}, ${host.username} at ${host.host}`}
      className="flex-row items-center gap-3 px-4 py-3 active:bg-secondary/60"
    >
      <InitialAvatar label={host.label} size={38} />

      <View className="min-w-0 flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="font-sans-medium min-w-0 flex-1 text-[14.5px]" numberOfLines={1}>
            {host.label}
          </Text>
          {/* Right-aligned and mono so the column stays put down the list */}
          <Text className="text-muted-foreground shrink-0 font-mono text-[11px]">
            {lastUsed ?? "never"}
          </Text>
        </View>

        <View className="mt-1 flex-row items-center gap-2">
          <Text
            className="text-muted-foreground min-w-0 shrink font-mono text-[12px]"
            numberOfLines={1}
          >
            {host.username}@{host.host}:{host.port}
          </Text>

          {/* Auth method gets an icon as well as a word — colour alone would
              not survive a screen reader or a monochrome display. */}
          <View className="border-border bg-secondary shrink-0 flex-row items-center gap-1 rounded-md border px-1.5 py-0.5">
            <AuthIcon size={10} strokeWidth={2.2} color={colors.mutedForeground} />
            <Text className="text-muted-foreground text-[10.5px]">
              {usingKey ? "key" : "password"}
            </Text>
          </View>
        </View>
      </View>

      <ChevronRight size={16} color={colors.mutedForeground} />

      <Pressable
        onPress={onMenu}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel={`Actions for ${host.label}`}
        className="-mr-1 h-8 w-8 items-center justify-center rounded-lg active:bg-secondary"
      >
        <MoreVertical size={16} color={colors.mutedForeground} />
      </Pressable>
    </Pressable>
  );
});

SshHostRow.displayName = "SshHostRow";

export default SshHostRow;
