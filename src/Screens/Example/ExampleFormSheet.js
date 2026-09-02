import { Package } from "lucide-react-native";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { FormSheet, SectionLabel, StatusToggle } from "@/components/pattern";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";

const BLANK = { name: "", description: "", status: "Active" };

/**
 * Create / edit form. Props mirror the web pattern's drawer contract:
 * `{ open, onClose, onSubmit, entity }` — the sheet owns its own chrome.
 *
 * The save button stays disabled until something actually changes, matching
 * the web's dirty-check.
 */
const ExampleFormSheet = ({ open, onClose, onSubmit, entity }) => {
  const isEdit = Boolean(entity?.itemId);
  const [draft, setDraft] = useState(BLANK);

  // Reload whenever a different record is opened
  useEffect(() => {
    setDraft(entity?.itemId ? { ...entity } : BLANK);
  }, [entity]);

  const set = (key) => (value) => setDraft((d) => ({ ...d, [key]: value }));

  const original = entity?.itemId ? entity : BLANK;
  const dirty =
    draft.name.trim() !== (original.name ?? "") ||
    draft.description.trim() !== (original.description ?? "") ||
    draft.status !== (original.status ?? "Active");

  const valid = draft.name.trim().length > 0;
  const canSave = dirty && valid;

  return (
    <FormSheet
      open={open}
      onClose={onClose}
      icon={Package}
      title={isEdit ? "Edit Item" : "Create New Item"}
      subtitle={
        isEdit ? "Update item information" : "Add a new item to the catalogue"
      }
      footer={
        <>
          <Button variant="outline" onPress={onClose} className="h-12 flex-1">
            <Text>Cancel</Text>
          </Button>
          <Button
            onPress={() => onSubmit({ ...draft, name: draft.name.trim() })}
            disabled={!canSave}
            className="h-12 flex-1"
          >
            <Text>{isEdit ? "Update Item" : "Create Item"}</Text>
          </Button>
        </>
      }
    >
      <SectionLabel>Details</SectionLabel>

      <View className="gap-4">
        <View className="gap-2">
          <Label nativeID="name">
            <Text className="font-sans-medium text-[13px]">Item name</Text>
          </Label>
          <Input
            aria-labelledby="name"
            value={draft.name}
            onChangeText={set("name")}
            placeholder="e.g. Aluminium Bracket"
            className="h-12"
          />
        </View>

        <View className="gap-2">
          <Label nativeID="description">
            <Text className="font-sans-medium text-[13px]">Description</Text>
          </Label>
          <Input
            aria-labelledby="description"
            value={draft.description}
            onChangeText={set("description")}
            placeholder="Size, material, packaging…"
            multiline
            numberOfLines={3}
            className="h-24 py-3"
            style={{ textAlignVertical: "top" }}
          />
          <Text className="text-muted-foreground text-right text-[11.5px]">
            {draft.description.length}/140
          </Text>
        </View>
      </View>

      <View className="mt-7">
        <SectionLabel>Status</SectionLabel>
        <StatusToggle value={draft.status} onChange={set("status")} />
      </View>

      {!valid ? (
        <Text className="text-muted-foreground mt-4 text-[12.5px]">
          An item name is required before you can save.
        </Text>
      ) : null}
    </FormSheet>
  );
};

export default ExampleFormSheet;
