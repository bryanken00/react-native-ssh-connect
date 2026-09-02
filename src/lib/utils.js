import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind class strings, with later classes winning conflicts.
 *
 * `clsx` flattens conditionals and arrays; `twMerge` then resolves collisions
 * so a caller's `className` can override a component's default:
 *
 *   cn("px-4 py-2 bg-primary", isGhost && "bg-transparent", className)
 *
 * Plain string concatenation would leave both `bg-` classes in place and let
 * declaration order decide — which is why every component takes `className`
 * and pipes it through here.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
