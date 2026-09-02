import { useNavigation } from "@react-navigation/native";
import { Archive, CheckCircle2, Package, Plus } from "lucide-react-native";
import { Alert, View } from "react-native";
import ScreenHeader from "@/components/ScreenHeader";
import {
  DataList,
  DataListRow,
  EmptyState,
  Fab,
  FAB_CLEARANCE,
  FilterBar,
  ListFooter,
  StatCard,
  StatusToggle,
} from "@/components/pattern";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { useThemeColors } from "@/hooks/useTheme";
import ExampleFormSheet from "./ExampleFormSheet";
import { useExampleModule } from "./useExampleModule";

/**
 * Reference implementation of the Modern module pattern — copy this folder to
 * start a new module. See docs/MODULE_PATTERN.md.
 *
 * Shape: fixed ScreenHeader → stat row → one list card (toolbar, rows, footer)
 * → floating create action → form sheet.
 *
 * The header sits OUTSIDE the list so it stays put while the rows scroll.
 * Everything that should scroll goes in `ListHeaderComponent` — DataList is a
 * FlatList and nesting it in a ScrollView breaks virtualisation.
 */
const ExampleScreen = () => {
  const colors = useThemeColors();
  const navigation = useNavigation();
  const m = useExampleModule();

  const confirmDelete = (record) =>
    Alert.alert("Delete item", `Delete "${record.name}"? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => m.remove(record.itemId),
      },
    ]);

  return (
    <View className="bg-background flex-1">
      <ScreenHeader title="Items" onBack={navigation.goBack} />

      <DataList
        data={m.pageItems}
        keyExtractor={(item) => item.itemId}
        onRefresh={() => {}}
        refreshing={false}
        // Reserve room so the FAB never covers the pager or the last row
        contentContainerClassName={FAB_CLEARANCE}
        renderItem={({ item, index }) => (
          <DataListRow
            index={(m.page - 1) * m.pageSize + index + 1}
            title={item.name}
            subtitle={item.description}
            status={item.status}
            onPress={() => m.openEdit(item)}
            onMenu={() => confirmDelete(item)}
          />
        )}
        ListHeaderComponent={
          <View className="flex-row flex-wrap gap-3 pb-5">
            <StatCard
              title="Total items"
              value={m.stats.total}
              change="all time"
              icon={Package}
              className="min-w-[45%] flex-1"
            />
            <StatCard
              title="Active"
              value={m.stats.active}
              change="in use"
              icon={CheckCircle2}
              className="min-w-[45%] flex-1"
            />
            <StatCard
              title="Inactive"
              value={m.stats.inactive}
              change="archived"
              icon={Archive}
              className="min-w-[45%] flex-1"
            />
          </View>
        }
        toolbar={
          <FilterBar
            value={m.search}
            onChangeText={m.setSearch}
            placeholder="Filter items…"
            onRefresh={() => {}}
            onToggleFilters={() => m.setShowFilters(!m.showFilters)}
            filtersActive={m.showFilters || m.hasActiveFilters}
          >
            {m.showFilters ? (
              <View className="gap-3">
                <StatusToggle
                  value={m.statusFilter ?? "All"}
                  onChange={(v) => m.setStatusFilter(v === "All" ? null : v)}
                  options={[
                    { value: "All", accent: false },
                    { value: "Active" },
                    { value: "Inactive", accent: false },
                  ]}
                />
                {m.hasActiveFilters ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onPress={m.clearFilters}
                    className="self-end"
                  >
                    <Text className="text-muted-foreground text-[12.5px]">
                      Clear all
                    </Text>
                  </Button>
                ) : null}
              </View>
            ) : null}
          </FilterBar>
        }
        empty={
          <EmptyState
            icon={Package}
            title="No items found"
            message={
              m.search || m.hasActiveFilters
                ? "Try a different search or clear your filters."
                : "Create your first item to get started."
            }
          />
        }
        footer={
          <ListFooter
            page={m.page}
            pageSize={m.pageSize}
            total={m.total}
            noun="item"
            onChangePage={m.setPage}
          />
        }
      />

      <Fab label="New item" icon={Plus} onPress={m.openCreate} />

      <ExampleFormSheet
        open={m.editing !== null}
        onClose={m.closeSheet}
        onSubmit={m.save}
        entity={m.editing}
      />
    </View>
  );
};

export default ExampleScreen;
