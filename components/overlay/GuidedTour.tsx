"use client";

import React, { useState, useEffect, useRef, ReactNode } from "react";
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

// --------------------------------------------
// TYPES
// --------------------------------------------

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
  offset?: number; // px from top when scrolling into view
};

type WelcomeStep = {
  title?: ReactNode;
  description?: ReactNode;
  startLabel?: ReactNode;
  skipLabel?: ReactNode;
};

type GuidedTourProps = {
  steps: TourStep[];
  onClose?: () => void;
  closeOnOverlayClick?: boolean;
  welcome?: WelcomeStep;
};

// --------------------------------------------
// CONSTANTS/UTILS
// --------------------------------------------

const PADDING = 16;

// Floating-ui virtual reference for highlight (with padding)
function makeVirtualElement(rect: DOMRect) {
  return {
    getBoundingClientRect: () =>
      ({
        top: rect.top - PADDING,
        left: rect.left - PADDING,
        right: rect.right + PADDING,
        bottom: rect.bottom + PADDING,
        width: rect.width + 2 * PADDING,
        height: rect.height + 2 * PADDING,
        x: rect.left - PADDING,
        y: rect.top - PADDING,
        toJSON: () => {},
      } as DOMRect),
  };
}

// --------------------------------------------
// COMPONENT
// --------------------------------------------

export const GuidedTour: React.FC<GuidedTourProps> = ({
  steps,
  onClose,
  closeOnOverlayClick = false,
  welcome,
}) => {
  const [showWelcome, setShowWelcome] = useState(!!welcome);
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

  // Floating UI
  const floating = useFloating({
    placement: step.placement || "bottom",
    middleware: [
      offset(18),
      flip(),
      shift({ padding: 8 }),
      arrow({ element: arrowRef, padding: 8 }),
    ],
    whileElementsMounted: autoUpdate,
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

  // --------------------------------------------
  // Centered Welcome Tooltip (portal)
  // --------------------------------------------

  const welcomeTooltip =
    showWelcome && welcome
      ? createPortal(
          <div
            className="fixed inset-0 z-[600] flex items-center justify-center pointer-events-auto bg-black/50"
            style={{ transition: "background 0.3s" }}
          >
            <div className="bg-white rounded-md shadow-lg p-6 max-w-sm mx-auto flex flex-col items-center">
              {welcome.title && (
                <p className="text-lg font-bold text-gray-800 pb-2 text-center">
                  {welcome.title}
                </p>
              )}
              {welcome.description && (
                <p className="text-sm text-gray-600 pb-6 text-center">
                  {welcome.description}
                </p>
              )}
              <div className="flex gap-4">
                <Button
                  variant="text"
                  size="small"
                  onClick={() => {
                    setShowWelcome(false);
                    setTimeout(() => onClose?.(), 300);
                  }}
                >
                  {welcome.skipLabel ?? "Skip"}
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  onClick={() => setShowWelcome(false)}
                >
                  {welcome.startLabel ?? "Start Tour"}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

  // --------------------------------------------
  // Step highlight, scroll, and floating-ui setup
  // --------------------------------------------

  useEffect(() => {
    // Only run when NOT on welcome
    if (showWelcome) return;

    let tipTimer: ReturnType<typeof setTimeout>;
    const el = document.querySelector(step.target) as HTMLElement | null;
    if (el) {
      const offset = step.offset ?? 0;
      const rect = el.getBoundingClientRect();
      const highlightTop = rect.top + window.scrollY - PADDING;
      if (highlightTop > window.innerHeight) {
        window.scrollTo({
          top: highlightTop - offset,
          behavior: "auto",
        });
      }

      requestAnimationFrame(() => {
        const rect2 = el.getBoundingClientRect();
        setPosition({
          top: rect2.top - PADDING,
          left: rect2.left - PADDING,
          width: rect2.width + 2 * PADDING,
          height: rect2.height + 2 * PADDING,
        });
        refs.setReference(makeVirtualElement(rect2));
        setShowOverlay(true);
      });
    }
    return () => {
      refs.setReference(null);
      setShowOverlay(false);
      setShowTooltip(false);
    };
    // eslint-disable-next-line
  }, [current, step.target, showWelcome]);

  // Set up floating ref for tooltip
  const tooltipRef = (node: HTMLDivElement | null) => {
    refs.setFloating(node);
  };

  // Resize spotlight + floating-ui on window resize (when not in welcome)
  useEffect(() => {
    setShowOverlay(true);
    const tipTimer = setTimeout(() => {
      setShowTooltip(true);
      setIsEntering(false);
    }, 600);
    return () => clearTimeout(tipTimer);
  }, []);

  // Handle window resize to update the spotlight overlay and tooltip reference
  useEffect(() => {
    const handleResize = () => {
      const el = document.querySelector(step.target) as HTMLElement | null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPosition({
        top: rect.top + window.scrollY - PADDING,
        left: rect.left + window.scrollX - PADDING,
        width: rect.width + 2 * PADDING,
        height: rect.height + 2 * PADDING,
      });
      refs.setReference(makeVirtualElement(rect));
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [step.target, refs, showWelcome]);

  // --------------------------------------------
  // Navigation
  // --------------------------------------------

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

  const changeStep = (newIndex: number) => {
    setShowTooltip(false);
    setTimeout(() => {
      setCurrent(newIndex);
      setShowOverlay(false);
      setIsEntering(true);
      setTimeout(() => setShowTooltip(true), 100);
    }, 300);
  };

  const next = () =>
    current < steps.length - 1 ? changeStep(current + 1) : handleClose();

  const prev = () => {
    if (current > 0) changeStep(current - 1);
  };

  const skip = () => handleClose();

  // --------------------------------------------
  // Floating-ui arrow
  // --------------------------------------------

  type Side = "top" | "bottom" | "left" | "right";
  const opposite: Record<Side, Side> = {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left",
  };
  const [baseSide] = actualPlacement.split("-") as [Side];
  const staticSide = opposite[baseSide];
  const arrowX = middlewareData.arrow?.x ?? 0;
  const arrowY = middlewareData.arrow?.y ?? 0;

  // --------------------------------------------
  // Floating-ui Tooltip + Arrow Portal
  // --------------------------------------------

  const tooltipAndArrow =
    showTooltip && !isExiting && !showWelcome
      ? createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            className={`z-500 pointer-events-auto transition-opacity duration-300 ease-in-out`}
            style={{
              position: strategy,
              top: y ?? 0,
              left: x ?? 0,
              zIndex: 500,
            }}
          >
            {/* Arrow */}
            <div
              ref={arrowRef}
              style={{
                position: "absolute",
                width: 12,
                height: 12,
                background: "#fff",
                transform: "rotate(45deg)",
                left: arrowX == 0 ? undefined : arrowX,
                top: arrowY == 0 ? undefined : arrowY,
                right: undefined,
                bottom: undefined,
                [staticSide]: -6,
                boxShadow:
                  "0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px 0 rgba(0,0,0,0.05)",
                zIndex: 0,
                pointerEvents: "none",
              }}
            />
            {/* Tooltip content */}
            <div className="bg-white shadow-lg p-4 rounded-md max-w-xs relative z-10">
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
            </div>
          </div>,
          document.body
        )
      : null;

  // --------------------------------------------
  // Render!
  // --------------------------------------------

  return (
    <>
      {welcomeTooltip}
      {!showWelcome && (
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
          {/* Tooltip and Arrow (portaled) */}
          {tooltipAndArrow}
        </>
      )}
    </>
  );
};
