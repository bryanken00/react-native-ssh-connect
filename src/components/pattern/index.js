/**
 * The Modern module pattern — see docs/MODULE_PATTERN.md.
 *
 *   import { DataList, StatCard, Fab } from "@/components/pattern";
 *
 * Screen titles use `@/components/ScreenHeader`, the app-wide header idiom —
 * there is deliberately no separate large-title header for modules.
 */
export { default as DataList } from "./DataList";
export { default as DataListRow } from "./DataListRow";
export { default as EmptyState } from "./EmptyState";
export { default as Fab, FAB_CLEARANCE } from "./Fab";
export { default as FilterBar } from "./FilterBar";
export { default as FormSheet } from "./FormSheet";
export { default as InitialAvatar } from "./InitialAvatar";
export { default as ListFooter } from "./ListFooter";
export { default as SectionLabel } from "./SectionLabel";
export { default as StatCard } from "./StatCard";
export { default as StatusDot } from "./StatusDot";
export { default as StatusToggle } from "./StatusToggle";
