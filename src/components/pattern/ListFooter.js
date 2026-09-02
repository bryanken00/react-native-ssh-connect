import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

/**
 * Footer inside the list card: a count on the left, prev / page / next on the
 * right.
 *
 * The web pattern also has a "10 / page" size dropdown. It is dropped here on
 * purpose — page size is a desktop affordance, and on a phone the count plus
 * arrows is enough. Add one back with a DropdownMenu if a screen needs it.
 *
 * For infinite scroll instead, drop this and use FlatList's `onEndReached`.
 *
 *   <ListFooter
 *     page={page} pageSize={20} total={total} noun="item"
 *     onChangePage={setPage}
 *   />
 */
const ListFooter = ({
  page = 1,
  pageSize = 20,
  total = 0,
  noun = "item",
  nounPlural,
  onChangePage,
  className,
}) => {
  const colors = useThemeColors();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const plural = nounPlural ?? `${noun}s`;
  const label =
    total === 0
      ? "No results"
      : `Showing ${start}${end > start ? `–${end}` : ""} of ${total} ${total === 1 ? noun : plural}`;

  const go = (p) => onChangePage?.(Math.min(Math.max(1, p), totalPages));

  const atStart = page <= 1;
  const atEnd = page >= totalPages;

  return (
    <View
      className={cn(
        "border-border flex-row items-center justify-between gap-3 border-t px-4 py-3",
        className,
      )}
    >
      <Text className="text-muted-foreground shrink text-[12.5px]" numberOfLines={1}>
        {label}
      </Text>

      <View className="flex-row items-center gap-1">
        <Pressable
          onPress={() => go(page - 1)}
          disabled={atStart}
          accessibilityLabel="Previous page"
          className={cn(
            "border-border h-8 w-8 items-center justify-center rounded-lg border",
            atStart ? "opacity-40" : "active:bg-secondary",
          )}
        >
          <ChevronLeft size={14} color={colors.foreground} />
        </Pressable>

        <View className="bg-primary h-8 min-w-8 items-center justify-center rounded-lg px-2">
          <Text className="text-primary-foreground font-mono text-[12.5px]">
            {page}
          </Text>
        </View>

        <Pressable
          onPress={() => go(page + 1)}
          disabled={atEnd}
          accessibilityLabel="Next page"
          className={cn(
            "border-border h-8 w-8 items-center justify-center rounded-lg border",
            atEnd ? "opacity-40" : "active:bg-secondary",
          )}
        >
          <ChevronRight size={14} color={colors.foreground} />
        </Pressable>
      </View>
    </View>
  );
};

export default ListFooter;
