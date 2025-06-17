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
  autoPlacement,
} from "@floating-ui/react-dom";
import Button from "../elements/Button";
import { useGlobalState } from "../../context/GlobalStateContext";
import { useMediaQuery } from "../../hooks/useMediaQuery";

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

export type TourConfig = {
  welcome?: {
    title?: ReactNode;
    description?: ReactNode;
    startLabel?: ReactNode;
    skipLabel?: ReactNode;
  };
  steps: TourStep[];
};

type GuidedTourProps = {
  config: TourConfig;
  onClose?: () => void;
  closeOnOverlayClick?: boolean;
};

// --------------------------------------------
// CONSTANTS/UTILS
// --------------------------------------------

const PADDING = 8;

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

// Find the closest scrollable parent of an element
function getScrollParent(element: HTMLElement | null): HTMLElement | Window {
  if (!element) return window;
  let parent = element.parentElement;
  while (parent) {
    const style = getComputedStyle(parent);
    if (
      /(auto|scroll|overlay)/.test(style.overflowY + style.overflowX) &&
      (parent.scrollHeight > parent.clientHeight ||
        parent.scrollWidth > parent.clientWidth)
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return window;
}

// Wait until the scroll is “settled” (not changing) for 100ms.
function waitForScrollSettled(
  getScroll: () => number,
  cb: () => void,
  stabilityWindow = 100, // ms
  timeout = 1500
) {
  let lastScroll = getScroll();
  let lastChanged = performance.now();
  let start = performance.now();

  function check(now: number) {
    const currScroll = getScroll();
    if (currScroll !== lastScroll) {
      lastScroll = currScroll;
      lastChanged = now;
    }
    if (now - lastChanged > stabilityWindow) {
      cb();
      return;
    }
    if (now - start > timeout) {
      cb();
      return;
    }
    requestAnimationFrame(check);
  }
  requestAnimationFrame(check);
}

// Smooth scroll helper with polling to detect finish
function smoothScrollTo(
  scrollParent: Window | HTMLElement,
  top: number,
  cb: () => void,
  timeout = 1500
) {
  const isWindow = scrollParent === window;
  const getScroll = () =>
    isWindow ? window.scrollY : (scrollParent as HTMLElement).scrollTop;

  if (isWindow) {
    window.scrollTo({ top, behavior: "smooth" });
  } else {
    (scrollParent as HTMLElement).scrollTo({ top, behavior: "smooth" });
  }
  waitForScrollSettled(getScroll, cb, 100, timeout);
}

// Scroll the correct scroll container to reveal the target, with offset and padding
function scrollElementIntoViewWithOffset(
  el: HTMLElement,
  offset: number,
  padding: number,
  cb: () => void
) {
  const scrollParent = getScrollParent(el);
  const rect = el.getBoundingClientRect();

  if (scrollParent === window) {
    // Visible area for the viewport
    const visibleTop = padding + offset;
    const visibleBottom = window.innerHeight - padding - offset;

    // Is element fully visible?
    if (rect.top >= visibleTop && rect.bottom <= visibleBottom) {
      cb(); // Already fully visible, just call the callback
      return;
    }

    const highlightTop = rect.top + window.scrollY - padding;
    smoothScrollTo(window, highlightTop - offset, cb);
  } else {
    const parent = scrollParent as HTMLElement;
    const parentRect = parent.getBoundingClientRect();

    // Visible area for the scroll parent
    const visibleTop = parentRect.top + padding + offset;
    const visibleBottom = parentRect.bottom - padding - offset;

    // Is element fully visible within parent?
    if (rect.top >= visibleTop && rect.bottom <= visibleBottom) {
      cb(); // Already fully visible
      return;
    }

    const highlightTop = rect.top - parentRect.top + parent.scrollTop - padding;

    smoothScrollTo(parent, highlightTop - offset, cb);
  }
}

// --------------------------------------------
// COMPONENT
// --------------------------------------------

export const GuidedTour: React.FC<GuidedTourProps> = ({
  config,
  onClose,
  closeOnOverlayClick = false,
}) => {
  const { steps, welcome } = config;
  const [showWelcome, setShowWelcome] = useState(!!welcome);
  const [current, setCurrent] = useState(0);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const { settings, openModal, closeModal } = useGlobalState();

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
      autoPlacement(),
      offset(18),
      // flip(),
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
  //  Welcome Modal
  // --------------------------------------------

  useEffect(() => {
    if (showWelcome && welcome) {
      openModal({
        title: String(welcome.title),
        content: (
          <div>
            {welcome.description && (
              <p className="text-sm text-gray-600 pb-6 text-center">
                {welcome.description}
              </p>
            )}
          </div>
        ),
        primaryButton: {
          label: String(welcome.startLabel) ?? "Start Tour",
          action: () => setShowWelcome(false),
        },
        secondaryButton: {
          label: String(welcome.skipLabel) ?? "Skip",
          action: () => {
            setIsExiting(true);
            setShowWelcome(false);
            setTimeout(() => onClose?.(), 300);
          },
        },
        closeOnBackdropClick: false,
        suppressCloseButton: true,
        showHeaderCloseButton: false,
        centered: true,
      });
    }
    // eslint-disable-next-line
  }, [showWelcome, welcome]);

  const isAboveMd = useMediaQuery("(min-width: 768px)");

  // --------------------------------------------
  // Step highlight, scroll, and floating-ui setup
  // --------------------------------------------

  useEffect(() => {
    if (showWelcome || isExiting) return;

    let cancelled = false;
    let tipTimer: ReturnType<typeof setTimeout>;

    const el = document.querySelector(step.target) as HTMLElement | null;
    if (el) {
      // const offset = step.offset ?? 0;
      const offset =
        settings.layout === "top" && isAboveMd ? step.offset ?? 16 : 16;
      scrollElementIntoViewWithOffset(el, offset, PADDING, () => {
        if (cancelled) return;
        const rect2 = el.getBoundingClientRect();
        setPosition({
          top: rect2.top - PADDING,
          left: rect2.left - PADDING,
          width: rect2.width + 2 * PADDING,
          height: rect2.height + 2 * PADDING,
        });
        refs.setReference(makeVirtualElement(rect2));
        if (isEntering) {
          setShowOverlay(true);
          tipTimer = setTimeout(() => {
            setShowTooltip(true);
            setIsEntering(false);
          }, 50);
        } else {
          setTimeout(() => {
            setShowTooltip(true);
          }, 600);
        }
      });
    }
    return () => {
      cancelled = true;
      refs.setReference(null);
      // setShowOverlay(false);
      setShowTooltip(false);
      // if (tipTimer) clearTimeout(tipTimer);
    };
    // eslint-disable-next-line
  }, [current, step.target, showWelcome]);

  // Set up floating ref for tooltip
  const tooltipRef = (node: HTMLDivElement | null) => {
    refs.setFloating(node);
  };

  // Handle window resize to update the spotlight overlay and tooltip reference
  useEffect(() => {
    if (showWelcome) return;
    const handleResize = () => {
      const el = document.querySelector(step.target) as HTMLElement | null;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPosition({
        top: rect.top - PADDING,
        left: rect.left - PADDING,
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
      // setShowOverlay(false);
      // setTimeout(() => setShowTooltip(true), 100);
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
    !isExiting && !showWelcome
      ? createPortal(
          <div
            ref={tooltipRef}
            role="tooltip"
            className={`z-500 shadow-lg pointer-events-auto transition-opacity duration-300 ease-in-out ${
              showTooltip ? "opacity-100" : "opacity-0"
            }`}
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
                zIndex: 0,
                pointerEvents: "none",
              }}
            />
            {/* Tooltip content */}
            <div className="bg-white p-4 rounded-md max-w-2xs md:max-w-xs relative z-10">
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
              className={`fixed pointer-events-none transition-all duration-200 ease-in-out rounded-md ${
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
