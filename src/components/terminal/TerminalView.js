import { ArrowDown } from "lucide-react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import { Text } from "@/components/ui/text";
import { useTerminalPalette, useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import TerminalLine from "./TerminalLine";

/**
 * The scrollback surface.
 *
 * ── Lines wrap; they do not scroll sideways ─────────────────────────────────
 * A desktop terminal clips at 80 columns and scrolls horizontally. On a phone
 * that means dragging left and right to read one line of `git log`, so lines
 * wrap instead. The cost is variable row heights, which rules out
 * `getItemLayout` — the trade the engineering checklist asks you to make
 * consciously. Everything else about the list is tuned for it: rows are
 * `React.memo`, clipped subviews are dropped, and the window is kept small.
 *
 * ── Sticky bottom ───────────────────────────────────────────────────────────
 * A terminal follows output until you scroll up to read something, and then it
 * must stop — nothing is more annoying than being yanked to the bottom
 * mid-sentence. Scrolling away detaches; the pill scrolls back and re-attaches.
 */

/** Distance from the bottom, in px, still counted as "following the output". */
const STICK_THRESHOLD = 48;

const TerminalView = ({ lines, fontSize = 12.5, className }) => {
  const colors = useThemeColors();
  const ansi = useTerminalPalette();
  const listRef = useRef(null);

  // Referential stability is what keeps TerminalLine's memo effective — a
  // fresh object here would re-render every line on every flush.
  const palette = useMemo(
    () => ({ ...ansi, background: colors.background }),
    [ansi, colors.background],
  );

  const lineHeight = Math.round(fontSize * 1.45);

  const stickRef = useRef(true);
  const [following, setFollowing] = useState(true);

  const setStick = useCallback((next) => {
    if (stickRef.current === next) return;
    stickRef.current = next;
    setFollowing(next);
  }, []);

  const onScroll = useCallback(
    ({ nativeEvent }) => {
      const { contentOffset, contentSize, layoutMeasurement } = nativeEvent;
      const fromBottom =
        contentSize.height - layoutMeasurement.height - contentOffset.y;
      setStick(fromBottom <= STICK_THRESHOLD);
    },
    [setStick],
  );

  const scrollToEnd = useCallback((animated = false) => {
    listRef.current?.scrollToEnd({ animated });
  }, []);

  const onContentSizeChange = useCallback(() => {
    if (stickRef.current) scrollToEnd(false);
  }, [scrollToEnd]);

  // The list also shrinks when the keyboard opens. Content size has not
  // changed, so onContentSizeChange never fires — without this the last line
  // slides up behind the input bar the moment you tap to type.
  const onLayout = useCallback(() => {
    if (stickRef.current) scrollToEnd(false);
  }, [scrollToEnd]);

  const renderItem = useCallback(
    ({ item }) => (
      <TerminalLine
        line={item}
        palette={palette}
        fontSize={fontSize}
        lineHeight={lineHeight}
      />
    ),
    [palette, fontSize, lineHeight],
  );

  return (
    <View className={cn("bg-background flex-1", className)}>
      <FlatList
        ref={listRef}
        data={lines}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.key)}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onContentSizeChange={onContentSizeChange}
        onLayout={onLayout}
        contentContainerClassName="px-3 py-2"
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={40}
        maxToRenderPerBatch={40}
        windowSize={9}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      />

      {!following ? (
        <View className="absolute bottom-3 right-3" pointerEvents="box-none">
          <Pressable
            onPress={() => {
              setStick(true);
              scrollToEnd(true);
            }}
            accessibilityRole="button"
            accessibilityLabel="Scroll to latest output"
            className="bg-primary border-border/40 h-9 flex-row items-center gap-1.5 rounded-full border px-3.5 active:opacity-90"
          >
            <ArrowDown size={14} color={colors.primaryForeground} strokeWidth={2.4} />
            <Text className="text-primary-foreground font-sans-medium text-[12.5px]">
              Latest
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

export default TerminalView;
