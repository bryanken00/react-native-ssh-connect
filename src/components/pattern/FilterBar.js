import { RotateCw, Search, SlidersHorizontal } from "lucide-react-native";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useThemeColors } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

/**
 * Toolbar that lives inside the top of the list card: search on its own line,
 * then refresh + filter buttons.
 *
 * The web version puts the input left and buttons right on one row; at phone
 * width that squeezes the input to uselessness, so it stacks.
 *
 *   <FilterBar
 *     value={search}
 *     onChangeText={setSearch}
 *     placeholder="Filter items…"
 *     onRefresh={refetch}
 *     refreshing={isFetching}
 *     filtersActive={hasActiveFilters}
 *     onToggleFilters={() => setShowFilters((v) => !v)}
 *   >
 *     {showFilters && <FilterRow … />}
 *   </FilterBar>
 */
const FilterBar = ({
  value,
  onChangeText,
  placeholder = "Search…",
  onRefresh,
  refreshing = false,
  onToggleFilters,
  filtersActive = false,
  children,
  className,
}) => {
  const colors = useThemeColors();

  return (
    <View className={cn("border-border border-b", className)}>
      <View className="flex-row items-center gap-2 px-4 py-3">
        <View className="relative min-w-0 flex-1 justify-center">
          <View className="absolute left-3 z-10">
            <Search size={15} color={colors.mutedForeground} />
          </View>
          <Input
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            className="h-10 pl-9"
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
        </View>

        {onRefresh ? (
          <Button
            variant="outline"
            size="icon"
            onPress={onRefresh}
            disabled={refreshing}
            accessibilityLabel="Refresh"
            className="h-10 w-10"
          >
            <RotateCw size={16} color={colors.foreground} />
          </Button>
        ) : null}

        {onToggleFilters ? (
          <Button
            variant={filtersActive ? "default" : "outline"}
            size="icon"
            onPress={onToggleFilters}
            accessibilityLabel="Filters"
            className="h-10 w-10"
          >
            <SlidersHorizontal
              size={16}
              color={
                filtersActive ? colors.primaryForeground : colors.foreground
              }
            />
          </Button>
        ) : null}
      </View>

      {/* Optional filter row — same padding, own hairline */}
      {children ? (
        <View className="border-border border-t px-4 py-3">{children}</View>
      ) : null}
    </View>
  );
};

export default FilterBar;
