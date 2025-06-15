"use client";

import React, {
  useState,
  useEffect,
  useRef,
  ReactNode,
  CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import {
  useFloating,
  offset,
  flip,
  shift,
  arrow,
  autoUpdate,
} from "@floating-ui/react-dom";
import Button from "../elements/Button";

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

export type TourStep = {
  target: string;
  title?: ReactNode;
  description?: ReactNode;
  placement?: Placement;
};

type GuidedTourProps = {
  steps: TourStep[];
  onClose?: () => void;
  closeOnOverlayClick?: boolean;
};

export const GuidedTour: React.FC<GuidedTourProps> = ({
  steps,
  onClose,
  closeOnOverlayClick = false,
}) => {
  const [current, setCurrent] = useState(0);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  // Animation states
  const [showOverlay, setShowOverlay] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isEntering, setIsEntering] = useState(true);

  const step = steps[current];
  const arrowRef = useRef<HTMLDivElement>(null);

  // --- Floating UI positioning ---
  const [referenceEl, setReferenceEl] = useState<HTMLElement | null>(null);
  const floating = useFloating({
    placement: step.placement || "bottom",
    middleware: [
      offset(18),
      flip(),
      shift({ padding: 8 }),
      arrow({ element: arrowRef }),
    ],
    whileElementsMounted: autoUpdate,
    // Only run if overlay is visible
    open: showTooltip && !isExiting,
  });
  const {
    x,
    y,
    strategy,
    refs,
    middlewareData,
    placement: actualPlacement,
  } = floating;

  // When the target element changes, update reference
  useEffect(() => {
    const el = document.querySelector(step.target) as HTMLElement | null;
    if (el) {
      setReferenceEl(el);
      refs.setReference(el);
      const rect = el.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
    }
    // Cleanup reference on unmount
    return () => refs.setReference(null);
    // eslint-disable-next-line
  }, [current, step.target]);

  // Set up floating ref
  const tooltipRef = (node: HTMLDivElement | null) => {
    refs.setFloating(node);
  };

  // Fade-in animation for overlay/tooltip
  useEffect(() => {
    setShowOverlay(true);
    const tipTimer = setTimeout(() => {
      setShowTooltip(true);
      setIsEntering(false);
    }, 600);
    return () => clearTimeout(tipTimer);
  }, []);

  // Handle window resize to update the spotlight overlay
  useEffect(() => {
    const handleResize = () => {
      const el = document.querySelector(step.target) as HTMLElement | null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [step.target]);

  // Close with fade-out
  const handleClose = () => {
    setIsExiting(true);
    setShowTooltip(false);
    setTimeout(() => {
      setTimeout(() => {
        setShowOverlay(false);
        setTimeout(() => onClose?.(), 300);
      }, 200);
    }, 200);
  };

  // Step navigation
  const changeStep = (newIndex: number) => {
    setShowTooltip(false);
    setTimeout(() => {
      setCurrent(newIndex);
      setTimeout(() => setShowTooltip(true), 100);
    }, 300);
  };

  const next = () =>
    current < steps.length - 1 ? changeStep(current + 1) : handleClose();

  const prev = () => {
    if (current > 0) changeStep(current - 1);
  };

  const skip = () => handleClose();

  // --- Floating-ui arrow positioning ---
  // Extract base side for arrow positioning
  type Side = "top" | "bottom" | "left" | "right";
  const opposite: Record<Side, Side> = {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left",
  };
  const [baseSide] = actualPlacement.split("-") as [Side];
  const staticSide = opposite[baseSide];

  // Arrow positioning
  const arrowX = middlewareData.arrow?.x ?? 0;
  const arrowY = middlewareData.arrow?.y ?? 0;

  // ARIA: Tooltip is always rendered as a portal at body
  const tooltip =
    showTooltip && !isExiting && referenceEl
      ? createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            className={`z-500 bg-white shadow-lg p-4 rounded-md max-w-xs pointer-events-auto transition-opacity duration-300 ease-in-out ${
              showTooltip && !isExiting ? "opacity-100" : "opacity-0"
            }`}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              zIndex: 500, // Tooltip above arrow
            }}
          >
            <div
              ref={arrowRef}
              style={{
                position: "absolute",
                width: 12,
                height: 12,
                background: "#fff",
                transform: "rotate(45deg)",
                left: arrowX,
                top: arrowY,
                right: "",
                bottom: "",
                [staticSide]: -6,
                zIndex: 0, // Arrow behind
                boxShadow:
                  "0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px 0 rgba(0,0,0,0.05)",
              }}
            />
            {step.title && (
              <p className="text-sm font-bold text-gray-800 pb-1">
                {step.title}
              </p>
            )}
            {step.description && (
              <p className="text-xs leading-4 text-gray-600 pb-3">
                {step.description}
              </p>
            )}
            <div className="flex justify-between">
              <span className="text-xs font-bold text-gray-800">
                Step {current + 1} of {steps.length}
              </span>
              <div className="flex items-center space-x-2">
                <Button variant="text" size="small" onClick={skip}>
                  Skip Tour
                </Button>
                <Button variant="primary" size="small" onClick={next}>
                  {current === steps.length - 1 ? "Done" : "Next"}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed z-250 inset-0 pointer-events-none transition-opacity duration-500 ${
          showOverlay ? "opacity-100" : "opacity-0"
        }`}
        style={{ background: "transparent" }}
        onClick={closeOnOverlayClick ? skip : undefined}
      >
        {/* Spotlight */}
        <div
          className={`fixed pointer-events-none transition-all duration-500 ease-in-out rounded-md ${
            isEntering ? "transition-none" : "transition-all"
          }`}
          style={{
            top: position.top,
            left: position.left,
            width: position.width,
            height: position.height,
            boxShadow: "0 0 0 max(100vh, 100vw) rgba(0, 0, 0, 0.5)",
          }}
        />
      </div>
      {/* Floating Tooltip */}
      {tooltip}
    </>
  );
};
