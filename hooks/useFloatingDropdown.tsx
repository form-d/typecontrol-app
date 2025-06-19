/**
 * useFloatingDropdown – Reusable hook for dropdown, menu, and tooltip positioning via Floating UI v2.
 *
 * Handles:
 *   - Flipping and collision detection (auto-positions above or below)
 *   - Sizing (matches trigger width, limits max height)
 *   - Outside click to close
 *   - Exposes refs and props for trigger and pane, compatible with portals
 *
 * ## Usage Example:
 *
 * import { useFloatingDropdown } from "./useFloatingDropdown";
 * import { createPortal } from "react-dom";
 *
 * function MyDropdown() {
 *   const {
 *     open, setOpen, referenceProps, floatingProps
 *   } = useFloatingDropdown();
 *
 *   return (
 *     <div>
 *       <button
 *         {...referenceProps}
 *         onClick={() => setOpen((v) => !v)}
 *       >Open Menu</button>
 *       {open && createPortal(
 *         <div {...floatingProps}>Dropdown Content</div>,
 *         document.body
 *       )}
 *     </div>
 *   );
 * }
 *
 */

import { useState, useEffect } from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  size,
  Placement,
} from "@floating-ui/react-dom";

type UseFloatingDropdownOptions = {
  /** Preferred dropdown placement (default: 'bottom-start') */
  placement?: Placement;
  /** Gap in pixels between trigger and dropdown (default: 0) */
  offsetPx?: number;
  /** If true, sets dropdown width to trigger width (default: true) */
  widthMatchReference?: boolean;
  /** Maximum dropdown height in px (default: 160) */
  maxHeightPx?: number;
};

/**
 * useFloatingDropdown hook: handles dropdown positioning, flipping, sizing, and outside click.
 */
export function useFloatingDropdown({
  placement = "bottom-start",
  offsetPx = 0,
  widthMatchReference = true,
  maxHeightPx = 160,
}: UseFloatingDropdownOptions = {}) {
  const [open, setOpen] = useState(false);

  // Floating UI for dynamic positioning and collision
  const { x, y, refs, strategy, update } = useFloating({
    placement,
    middleware: [
      offset(offsetPx),
      flip(),
      size({
        apply({ availableHeight, rects, elements }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.max(maxHeightPx, availableHeight) - 24}px`,
            ...(widthMatchReference
              ? { width: `${rects.reference.width}px` }
              : {}),
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  // Closes dropdown on click outside trigger or dropdown
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      const refEl = refs.reference.current;
      const floatEl = refs.floating.current;
      if (
        !(refEl instanceof Element && refEl.contains(e.target as Node)) &&
        !(floatEl instanceof Element && floatEl.contains(e.target as Node))
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, refs.reference, refs.floating]);

  return {
    /** Is the dropdown open? */
    open,
    /** Open/close the dropdown */
    setOpen,
    /** Floating UI refs (advanced use) */
    refs,
    /** X position for floating element (usually handled via floatingProps) */
    x,
    /** Y position for floating element (usually handled via floatingProps) */
    y,
    /** CSS position strategy (usually 'absolute') */
    strategy,
    /** Call to manually update position */
    update,
    /** Attach to dropdown panel */
    floatingProps: {
      ref: (node: HTMLElement | null) => refs.setFloating(node),
      style: {
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
        zIndex: 20,
      },
    },
    /** Attach to trigger/anchor/target element */
    referenceProps: {
      ref: (node: HTMLElement | null) => refs.setReference(node),
    },
  };
}
