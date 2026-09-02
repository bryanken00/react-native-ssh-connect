import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

/**
 * Square-ish tile showing the first letter of a label. Deliberately monochrome
 * — the Modern pattern does not tint avatars by hash.
 *
 *   <InitialAvatar label="Administrator" />
 *   <InitialAvatar label={user.fullName} size={38} />
 */
const InitialAvatar = ({ label, size = 34, className }) => {
  const initial = (String(label ?? "").trim().charAt(0) || "?").toUpperCase();

  return (
    <View
      className={cn(
        "border-border bg-secondary shrink-0 items-center justify-center rounded-lg border",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <Text
        className="text-muted-foreground font-sans-semibold"
        style={{ fontSize: size * 0.42 }}
      >
        {initial}
      </Text>
    </View>
  );
};

export default InitialAvatar;
