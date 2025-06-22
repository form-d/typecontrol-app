/**
 * useFloatingDropdown – Reusable hook for dropdown, menu, and tooltip positioning via Floating UI v2.
 *
 * Features:
 *   - Flipping and collision detection (auto-positions above or below)
 *   - Sizing (matches trigger width, limits max height)
 *   - Outside click to close
 *   - Modal mode: disables scroll/pointer outside while open (optional)
 *   - Closes on touch scroll (mobile) only if touch starts outside trigger/dropdown, with debounce
 *   - Exposes refs and props for trigger and pane, compatible with portals
 *
 * ## Usage Example:
 * import { useFloatingDropdown } from "./useFloatingDropdown";
 * import { createPortal } from "react-dom";
 *
 * function MyDropdown() {
 *   const {
 *     open, setOpen, referenceProps, floatingProps, pointerTrap
 *   } = useFloatingDropdown({ modal: true });
 *
 *   return (
 *     <div>
 *       <button
 *         {...referenceProps}
 *         onClick={() => setOpen((v) => !v)}
 *         aria-expanded={open}
 *         aria-haspopup="menu"
 *       >Open Menu</button>
 *       {pointerTrap}
 *       {open && createPortal(
 *         <div {...floatingProps} role="menu">Dropdown Content</div>,
 *         document.body
 *       )}
 *     </div>
 *   );
 * }
 */

import { useState, useEffect, useRef } from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  size,
  Placement,
} from "@floating-ui/react-dom";
import { createPortal } from "react-dom";

// Simple debounce helper
function debounce<T extends (...args: any[]) => void>(fn: T, ms = 150) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
}

type UseFloatingDropdownOptions = {
  /** Preferred dropdown placement (default: 'bottom-start') */
  placement?: Placement;
  /** Gap in pixels between trigger and dropdown (default: 0) */
  offsetPx?: number;
  /** If true, sets dropdown width to trigger width (default: true) */
  widthMatchReference?: boolean;
  /** Maximum dropdown height in px (default: 160) */
  maxHeightPx?: number;
  /** When true, prevent scroll and pointer/hover outside while open */
  modal?: boolean;
  /** Callback when click outside occurs */
  onClickOutside?: () => void;
};

/**
 * useFloatingDropdown hook: handles dropdown positioning, flipping, sizing, outside click, modal and touch scroll-to-close.
 */
export function useFloatingDropdown({
  placement = "bottom-start",
  offsetPx = 0,
  widthMatchReference = true,
  maxHeightPx = 160,
  modal = true,
  onClickOutside,
}: UseFloatingDropdownOptions = {}) {
  const [open, setOpen] = useState(false);

  const { x, y, refs, strategy, update } = useFloating({
    placement,
    middleware: [
      offset(offsetPx),
      flip(),
      size({
        apply({ availableHeight, rects, elements }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.max(maxHeightPx, availableHeight) - 16}px`,
            ...(widthMatchReference
              ? { width: `${rects.reference.width}px` }
              : {}),
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  // Click outside to close
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
        if (typeof onClickOutside === "function") {
          onClickOutside();
        }
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open, refs.reference, refs.floating, onClickOutside]);

  // Modal/Scroll & pointer event trap logic
  useEffect(() => {
    if (!open || !modal) return;

    // Prevent scroll on body
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [open, modal]);

  // Helper to check for non-touch device
  function isNonTouchDevice() {
    if (typeof window === "undefined") return true;
    return !(
      "ontouchstart" in window ||
      (window.matchMedia && window.matchMedia("(pointer: coarse)").matches)
    );
  }

  // Pointer/hover trap overlay for modal, desktop only
  const pointerTrap =
    open && modal && isNonTouchDevice()
      ? createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 19,
              background: "transparent",
              pointerEvents: "all",
            }}
            aria-hidden="true"
            tabIndex={-1}
          />,
          document.body
        )
      : null;

  // --- Close dropdown on touch scroll (mobile) if touch starts outside ---
  const touchScrollRef = useRef<{ lastY: number | null; shouldClose: boolean }>(
    {
      lastY: null,
      shouldClose: false,
    }
  );

  useEffect(() => {
    if (!open) return;

    function onTouchStart(e: TouchEvent) {
      touchScrollRef.current.lastY = e.touches[0]?.clientY ?? null;
      const refEl = refs.reference.current;
      const floatEl = refs.floating.current;
      const target = e.target as Node;
      // Only close if touch starts outside both trigger and dropdown
      if (
        (refEl instanceof Element && refEl.contains(target)) ||
        (floatEl instanceof Element && floatEl.contains(target))
      ) {
        touchScrollRef.current.shouldClose = false;
      } else {
        touchScrollRef.current.shouldClose = true;
      }
    }
    const closeDropdown = debounce(() => setOpen(false), 80);

    function onTouchMove(e: TouchEvent) {
      if (!touchScrollRef.current.shouldClose) return;
      const lastY = touchScrollRef.current.lastY;
      const currentY = e.touches[0]?.clientY ?? null;
      if (
        lastY !== null &&
        currentY !== null &&
        Math.abs(currentY - lastY) > 5
      ) {
        closeDropdown();
        touchScrollRef.current.lastY = null;
      }
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [open, refs.reference, refs.floating]);

  return {
    /** Is the dropdown open? (uncontrolled by default) */
    open,
    /** Call setOpen(true/false) to open/close the dropdown (or use setOpen(v => !v) to toggle) */
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
    /** If modal: render {pointerTrap} just before your dropdown portal */
    pointerTrap,
  };
}
