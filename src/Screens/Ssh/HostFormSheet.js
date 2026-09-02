import { KeyRound, Server } from "lucide-react-native";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { FormSheet, SectionLabel, StatusToggle } from "@/components/pattern";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/useTheme";
import { BLANK_HOST } from "./useSshHosts";

/**
 * Add / edit a connection. Same `{ open, onClose, onSubmit, entity }` contract
 * as `ExampleFormSheet`.
 *
 * ── Credentials are write-only ──────────────────────────────────────────────
 * Opening an existing host does **not** load its password or key back into the
 * form. Two reasons, and the second is the important one:
 *
 *   1. There is no good reason to move a secret out of the Keychain and into
 *      React state just to display dots for it.
 *   2. It removes the "did I just wipe the stored key by opening this?"
 *      question entirely — blank means keep, typed means replace. The saver
 *      (`useSshHosts.buildSecret`) implements exactly that.
 *
 * The one case where blank is not allowed is a new host, or an edit that
 * switches auth type — the stored credential is then the wrong kind, so
 * `credentialRequired` forces a fresh one.
 */
const HostFormSheet = ({ open, onClose, onSubmit, entity, saving = false }) => {
  const colors = useThemeColors();
  const isEdit = Boolean(entity?.hostId);
  const [draft, setDraft] = useState(BLANK_HOST);

  // Reload whenever a different host is opened. Port arrives from SQLite as a
  // number and TextInput needs a string.
  useEffect(() => {
    setDraft(
      entity?.hostId
        ? { ...BLANK_HOST, ...entity, port: String(entity.port ?? 22) }
        : BLANK_HOST,
    );
  }, [entity]);

  const set = (key) => (value) => setDraft((d) => ({ ...d, [key]: value }));

  const usingKey = draft.authType === "key";
  const authChanged = isEdit && draft.authType !== entity.authType;
  const credentialRequired = !isEdit || authChanged;

  const hasCredential = usingKey
    ? draft.privateKey.trim().length > 0
    : draft.password.length > 0;

  const portNumber = Number(draft.port);
  const portValid =
    Number.isInteger(portNumber) && portNumber > 0 && portNumber <= 65535;

  const valid =
    draft.label.trim().length > 0 &&
    draft.host.trim().length > 0 &&
    draft.username.trim().length > 0 &&
    portValid &&
    (hasCredential || !credentialRequired);

  const problem = () => {
    if (!draft.label.trim()) return "Give this connection a name.";
    if (!draft.host.trim()) return "A hostname or IP address is required.";
    if (!draft.username.trim()) return "A username is required.";
    if (!portValid) return "Port must be a number between 1 and 65535.";
    if (!hasCredential && credentialRequired) {
      return authChanged
        ? "You changed the authentication method, so a new credential is needed."
        : usingKey
          ? "Paste the private key to finish."
          : "A password is required.";
    }
    return null;
  };

  return (
    <FormSheet
      open={open}
      onClose={onClose}
      icon={Server}
      title={isEdit ? "Edit Connection" : "New SSH Connection"}
      subtitle={
        isEdit
          ? "Update where and how you connect"
          : "Save a host you can open with one tap"
      }
      footer={
        <>
          <Button
            variant="outline"
            onPress={onClose}
            disabled={saving}
            className="h-12 flex-1"
          >
            <Text>Cancel</Text>
          </Button>
          <Button
            onPress={() => onSubmit(draft)}
            disabled={!valid || saving}
            className="h-12 flex-1"
          >
            <Text>
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Connection"}
            </Text>
          </Button>
        </>
      }
    >
      <SectionLabel>Connection</SectionLabel>

      <View className="gap-4">
        <View className="gap-2">
          <Label nativeID="label">
            <Text className="font-sans-medium text-[13px]">Name</Text>
          </Label>
          <Input
            aria-labelledby="label"
            value={draft.label}
            onChangeText={set("label")}
            placeholder="e.g. Production API"
            autoCapitalize="words"
            className="h-12"
          />
        </View>

        {/* Host and port share a row — port is four characters and does not
            deserve a full-width field, even at 320px. */}
        <View className="flex-row gap-3">
          <View className="min-w-0 flex-[3] gap-2">
            <Label nativeID="host">
              <Text className="font-sans-medium text-[13px]">Host</Text>
            </Label>
            <Input
              aria-labelledby="host"
              value={draft.host}
              onChangeText={set("host")}
              placeholder="10.0.0.4 or example.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              className="h-12 font-mono"
            />
          </View>

          <View className="min-w-0 flex-1 gap-2">
            <Label nativeID="port">
              <Text className="font-sans-medium text-[13px]">Port</Text>
            </Label>
            <Input
              aria-labelledby="port"
              value={draft.port}
              onChangeText={set("port")}
              placeholder="22"
              keyboardType="number-pad"
              maxLength={5}
              className="h-12 font-mono"
            />
          </View>
        </View>

        <View className="gap-2">
          <Label nativeID="username">
            <Text className="font-sans-medium text-[13px]">Username</Text>
          </Label>
          <Input
            aria-labelledby="username"
            value={draft.username}
            onChangeText={set("username")}
            placeholder="root"
            autoCapitalize="none"
            autoCorrect={false}
            className="h-12 font-mono"
          />
        </View>
      </View>

      <View className="mt-7">
        <SectionLabel>Authentication</SectionLabel>

        <StatusToggle
          value={usingKey ? "Key" : "Password"}
          onChange={(v) => set("authType")(v === "Key" ? "key" : "password")}
          options={[{ value: "Password" }, { value: "Key", accent: false }]}
        />

        <View className="mt-4 gap-4">
          {usingKey ? (
            <>
              <View className="gap-2">
                <Label nativeID="privateKey">
                  <Text className="font-sans-medium text-[13px]">
                    Private key
                  </Text>
                </Label>
                <Input
                  aria-labelledby="privateKey"
                  value={draft.privateKey}
                  onChangeText={set("privateKey")}
                  placeholder={
                    credentialRequired
                      ? "-----BEGIN OPENSSH PRIVATE KEY-----"
                      : "Leave blank to keep the saved key"
                  }
                  multiline
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  className="h-32 py-3 font-mono text-[11px]"
                  style={{ textAlignVertical: "top" }}
                />
                <Text className="text-muted-foreground text-[11.5px] leading-relaxed">
                  Paste the whole file, header and footer lines included. Use an
                  ed25519 key — secure storage on Android is unreliable above
                  ~2KB, which rules out most RSA keys.
                </Text>
              </View>

              <View className="gap-2">
                <Label nativeID="passphrase">
                  <Text className="font-sans-medium text-[13px]">
                    Passphrase{" "}
                    <Text className="text-muted-foreground">(optional)</Text>
                  </Text>
                </Label>
                <Input
                  aria-labelledby="passphrase"
                  value={draft.passphrase}
                  onChangeText={set("passphrase")}
                  placeholder="Only if the key is encrypted"
                  secureTextEntry
                  autoCapitalize="none"
                  className="h-12"
                />
              </View>
            </>
          ) : (
            <View className="gap-2">
              <Label nativeID="password">
                <Text className="font-sans-medium text-[13px]">Password</Text>
              </Label>
              <Input
                aria-labelledby="password"
                value={draft.password}
                onChangeText={set("password")}
                placeholder={
                  credentialRequired
                    ? "Account password"
                    : "Leave blank to keep the saved password"
                }
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                className="h-12"
              />
            </View>
          )}
        </View>

        <View className="border-border bg-secondary mt-4 flex-row gap-3 rounded-xl border p-3.5">
          <KeyRound size={16} strokeWidth={2} color={colors.mutedForeground} />
          <Text className="text-muted-foreground min-w-0 flex-1 text-[12px] leading-relaxed">
            Credentials go to the device keychain, never to the app database and
            never off the device.
          </Text>
        </View>
      </View>

      {!valid ? (
        <Text className="text-muted-foreground mt-4 text-[12.5px]">
          {problem()}
        </Text>
      ) : null}
    </FormSheet>
  );
};

export default HostFormSheet;
