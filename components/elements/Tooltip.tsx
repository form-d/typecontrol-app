"use client";

import React, { useState, ReactElement, useRef } from "react";
import { createPortal } from "react-dom";
import {
  useFloating,
  offset,
  flip,
  shift,
  arrow,
  autoUpdate,
} from "@floating-ui/react-dom";

export type Placement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

// 1) Define a union for the four sides.
type Side = "top" | "right" | "bottom" | "left";

// 2) Build a map from each side to its opposite
const opposite: Record<Side, Side> = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right",
};

export interface TooltipProps {
  /** Tooltip content */
  content: React.ReactNode;
  /** Preferred placement */
  placement?: Placement;
  /** Delay before showing (ms) */
  delay?: number;
  /** Trigger element */
  children: ReactElement;
  enabled?: boolean;
}

/**
 * Tooltip using @floating-ui/react-dom for positioning.
 */
const Tooltip: React.FC<TooltipProps> = ({
  content,
  placement = "top",
  delay = 200,
  children,
  enabled = true,
}) => {
  const arrowRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  // This utility returns true if the device is touch-capable
  const isTouchDevice =
    typeof window !== "undefined" &&
    ("ontouchstart" in window || navigator.maxTouchPoints > 0);

  const floatingContext = useFloating({
    placement,
    middleware: [
      offset(12),
      flip(),
      shift({ padding: 4 }),
      arrow({ element: arrowRef }),
    ],
    whileElementsMounted: autoUpdate,
  });
  const {
    x,
    y,
    strategy,
    middlewareData,
    refs,
    placement: finalPlacement,
  } = floatingContext;
  // const { reference, floating } = refs;

  // show/hide handlers
  const show = () => {
    if (isTouchDevice) return;
    if (timeoutId) window.clearTimeout(timeoutId);
    const id = window.setTimeout(() => setOpen(true), delay);
    setTimeoutId(id);
  };
  const hide = () => {
    if (timeoutId) window.clearTimeout(timeoutId);
    setOpen(false);
  };

  // arrow positioning
  const arrowX = middlewareData.arrow?.x ?? "";
  const arrowY = middlewareData.arrow?.y ?? "";

  // 3) Assert the split is a Side
  const [base] = finalPlacement.split("-") as [Side];

  // 4) Lookup the opposite side – now TS knows it's a Side
  const staticSide: Side = opposite[base];

  // If not enabled, only render the children
  if (!enabled) {
    if (open) setOpen(false);
    return <>{children}</>;
  }

  // When enabled, render the full tooltip markup
  return (
    <>
      <div
        ref={refs.setReference}
        onMouseEnter={show}
        onMouseLeave={hide}
        onClick={hide}
        onFocus={() => {
          if (!isTouchDevice) {
            show();
          }
        }}
        onBlur={hide}
        className="inline-block"
      >
        {children}
      </div>

      {open &&
        createPortal(
          <div
            ref={refs.setFloating}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              zIndex: 9999,
            }}
          >
            <div className="relative bg-gray-700 text-white text-xs rounded-sm py-1 px-2 max-w-xs whitespace-normal break-words">
              {content}
              <div
                ref={arrowRef}
                style={{
                  position: "absolute",
                  width: 8,
                  height: 8,
                  background: "#374151",
                  transform: "rotate(45deg)",
                  left: arrowX,
                  top: arrowY,
                  right: "",
                  bottom: "",
                  [staticSide]: -4,
                }}
              />
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default Tooltip;
