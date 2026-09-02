import { FlatList, View } from "react-native";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import EmptyState from "./EmptyState";

/**
 * The card that replaces the web `<Table>`: a bordered container holding an
 * optional toolbar, hairline-divided rows, and an optional footer.
 *
 * Rows are virtualised through FlatList, so this stays cheap on long lists.
 * Because it scrolls internally, do NOT nest it in a ScrollView — put the
 * header and stat cards in `ListHeaderComponent` instead (see the example
 * module).
 *
 *   <DataList
 *     data={items}
 *     keyExtractor={(r) => r.itemId}
 *     renderItem={({ item, index }) => (
 *       <DataListRow index={index + 1} title={item.name} … />
 *     )}
 *     toolbar={<FilterBar … />}
 *     footer={<ListFooter … />}
 *     ListHeaderComponent={<>…</>}
 *   />
 *
 * `toolbar` and `footer` live inside the card's border; `ListHeaderComponent`
 * renders above it, on the canvas.
 */
const DataList = ({
  data = [],
  renderItem,
  keyExtractor,
  toolbar,
  footer,
  empty,
  loading = false,
  ListHeaderComponent,
  onRefresh,
  refreshing = false,
  contentContainerClassName,
  className,
}) => {
  const isEmpty = !loading && data.length === 0;

  return (
    <FlatList
      data={isEmpty ? [] : data}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      onRefresh={onRefresh}
      refreshing={refreshing}
      showsVerticalScrollIndicator={false}
      contentContainerClassName={cn("p-4 pb-10", contentContainerClassName)}
      ItemSeparatorComponent={() => <Separator className="bg-line-soft" />}
      ListHeaderComponent={
        <>
          {ListHeaderComponent}
          {/* Card opens here: rounded top, border, no bottom edge yet */}
          <View
            className={cn(
              "border-border bg-card overflow-hidden rounded-t-[14px] border border-b-0",
              !toolbar && "h-0 border-t-0",
              className,
            )}
          >
            {toolbar}
          </View>
        </>
      }
      ListEmptyComponent={
        <View className="border-border bg-card border-x">
          {empty ?? <EmptyState />}
        </View>
      }
      ListFooterComponent={
        <View className="border-border bg-card overflow-hidden rounded-b-[14px] border border-t-0">
          {footer}
        </View>
      }
      // Rows sit between the header and footer slices of the card, so they
      // carry the side borders themselves.
      CellRendererComponent={({ children, ...props }) => (
        <View {...props} className="border-border bg-card border-x">
          {children}
        </View>
      )}
    />
  );
};

export default DataList;
