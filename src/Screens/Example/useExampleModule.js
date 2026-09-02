import { useMemo, useState } from "react";

/**
 * Module state: search, filter, pagination, and the form sheet.
 *
 * Kept out of the screen so the screen file stays layout-only.
 *
 * Records use the same shape as the local `items` table —
 * `{ itemId, name, description, status }` — so swapping this in-memory array
 * for the SQLite layer is a drop-in:
 *
 *   import { db_getItems, db_insertItem } from "@/store/database/endpoints/example.endpoints";
 *
 * It runs in memory here so the example works with no database and no backend.
 */

const SEED = [
  { itemId: "1", name: "Aluminium Bracket", description: "Structural mounting part", status: "Active" },
  { itemId: "2", name: "Copper Wire Spool", description: "2.5mm, 100m reel", status: "Active" },
  { itemId: "3", name: "Hex Bolt M8", description: "Zinc plated, box of 200", status: "Active" },
  { itemId: "4", name: "Rubber Gasket", description: "Seal ring, 40mm", status: "Inactive" },
  { itemId: "5", name: "Steel Plate", description: "3mm cold rolled", status: "Active" },
  { itemId: "6", name: "Torque Wrench", description: "Calibrated, 5–50Nm", status: "Inactive" },
  { itemId: "7", name: "Zip Tie Pack", description: "200mm, 100 pieces", status: "Active" },
];

const PAGE_SIZE = 5;

export const useExampleModule = () => {
  const [records, setRecords] = useState(SEED);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(null); // null = all
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  // Form sheet: null = closed, {} = create, {…record} = edit
  const [editing, setEditing] = useState(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      const matchesQuery =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q);
      const matchesStatus = !statusFilter || r.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [records, search, statusFilter]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  // Clamp so deleting the last row on page 3 doesn't strand you on an empty page
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const stats = useMemo(
    () => ({
      total: records.length,
      active: records.filter((r) => r.status === "Active").length,
      inactive: records.filter((r) => r.status !== "Active").length,
    }),
    [records],
  );

  const save = (draft) => {
    setRecords((prev) =>
      draft.itemId
        ? prev.map((r) => (r.itemId === draft.itemId ? { ...r, ...draft } : r))
        : [...prev, { ...draft, itemId: String(Date.now()) }],
    );
    setEditing(null);
  };

  const remove = (itemId) =>
    setRecords((prev) => prev.filter((r) => r.itemId !== itemId));

  // Any filter narrowing the set — drives the Filters button's active state
  const hasActiveFilters = Boolean(statusFilter);

  return {
    // data
    pageItems,
    stats,
    total,
    // search + filter
    search,
    setSearch: (v) => {
      setSearch(v);
      setPage(1);
    },
    statusFilter,
    setStatusFilter: (v) => {
      setStatusFilter(v);
      setPage(1);
    },
    showFilters,
    setShowFilters,
    hasActiveFilters,
    clearFilters: () => {
      setStatusFilter(null);
      setPage(1);
    },
    // pagination
    page: safePage,
    pageSize: PAGE_SIZE,
    setPage,
    // form sheet
    editing,
    openCreate: () => setEditing({}),
    openEdit: (record) => setEditing(record),
    closeSheet: () => setEditing(null),
    save,
    remove,
  };
};

export default useExampleModule;
