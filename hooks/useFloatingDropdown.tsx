import { useRef, useState, useEffect, RefCallback } from "react";
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  size,
  Placement,
} from "@floating-ui/react-dom";

type FloatingDropdownOptions = {
  placement?: Placement;
  offsetPx?: number;
  widthMatchReference?: boolean;
  maxHeightPx?: number;
};

export function useFloatingDropdown({
  placement = "bottom-start",
  offsetPx = 4,
  widthMatchReference = true,
  maxHeightPx = 240,
}: FloatingDropdownOptions = {}) {
  const [open, setOpen] = useState(false);

  const { x, y, refs, strategy, update } = useFloating({
    placement,
    middleware: [
      offset(offsetPx),
      flip(),
      size({
        apply({ availableHeight, rects, elements }) {
          Object.assign(elements.floating.style, {
            maxHeight: `${Math.max(maxHeightPx, availableHeight)}px`,
            ...(widthMatchReference
              ? { width: `${rects.reference.width}px` }
              : {}),
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  // Safe outside click handling
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      const refEl = refs.reference.current;
      const floatEl = refs.floating.current;
      if (
        !(refEl instanceof Element && refEl.contains(e.target as Node)) &&
        !(floatEl instanceof Element && floatEl.contains(e.target as Node))
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, refs.reference, refs.floating]);

  // Expose everything needed for wiring up
  return {
    open,
    setOpen,
    refs,
    x,
    y,
    strategy,
    update,
    floatingProps: {
      ref: (node: HTMLElement | null) => refs.setFloating(node),
      style: {
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,
        zIndex: 30,
      },
    },
    referenceProps: {
      ref: (node: HTMLElement | null) => refs.setReference(node),
    },
  };
}
