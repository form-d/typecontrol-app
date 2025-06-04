"use client";

import React, {
  useState,
  useEffect,
  useRef,
  ReactNode,
  CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import Button from "../elements/Button";

export type Placement =
  | "top-start"
  | "top"
  | "top-end"
  | "bottom-start"
  | "bottom"
  | "bottom-end"
  | "left-start"
  | "left"
  | "left-end"
  | "right-start"
  | "right"
  | "right-end";

export type TourStep = {
  /** CSS selector for the element to highlight */
  target: string;
  /** Optional heading text for the tooltip */
  title?: ReactNode;
  /** Optional body text for the tooltip */
  description?: ReactNode;
  /** Tooltip placement (default: bottom) */
  placement?: Placement;
};

type GuidedTourProps = {
  /** Tour steps */
  steps: TourStep[];
  /** Called when tour finishes or is skipped */
  onClose?: () => void;
  /** Clicking the backdrop closes the tour */
  closeOnBackdropClick?: boolean;
};

export const GuidedTour: React.FC<GuidedTourProps> = ({
  steps,
  onClose,
  closeOnBackdropClick = false,
}) => {
  // State for current step and positioning
  const [current, setCurrent] = useState(0);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipSize, setTooltipSize] = useState({ width: 0, height: 0 });

  // Animation & exit states
  const [showBackdrop, setShowBackdrop] = useState(false);
  const [showRing, setShowRing] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const step = steps[current];

  // Initial fade-in sequence
  useEffect(() => {
    setShowBackdrop(true);
    const ringTimer = setTimeout(() => setShowRing(true), 300);
    const tipTimer = setTimeout(() => setShowTooltip(true), 600);
    return () => {
      clearTimeout(ringTimer);
      clearTimeout(tipTimer);
    };
  }, []);

  // Update spotlight position on step change and elevate target above backdrop
  useEffect(() => {
    const el = document.querySelector(step.target) as HTMLElement | null;
    if (!el) return;
    // store original styles
    const origZ = el.style.zIndex;
    const origPos = el.style.position;
    // ensure element is positioned and above backdrop
    if (getComputedStyle(el).position === "static") {
      el.style.position = "relative";
    }
    el.style.zIndex = "1000";

    const rect = el.getBoundingClientRect();
    setPosition({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
    });

    // restore on cleanup
    return () => {
      el.style.zIndex = origZ;
      el.style.position = origPos;
    };
  }, [current, step.target]);

  // Handle window resize
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

  // Measure tooltip dimensions
  useEffect(() => {
    if (!tooltipRef.current) return;
    const rect = tooltipRef.current.getBoundingClientRect();
    setTooltipSize({ width: rect.width, height: rect.height });
  }, [current, showTooltip]);

  // Close with fade-out
  const handleClose = () => {
    setIsExiting(true);
    setShowTooltip(false);
    setTimeout(() => {
      setShowRing(false);
      setTimeout(() => {
        setShowBackdrop(false);
        setTimeout(() => onClose?.(), 300);
      }, 200);
    }, 200);
  };

  // Navigate between steps
  const changeStep = (newIndex: number) => {
    setShowTooltip(false);
    setShowRing(false);
    setTimeout(() => {
      setCurrent(newIndex);
      setShowRing(true);
      setTimeout(() => setShowTooltip(true), 100);
    }, 300);
  };

  const next = () => {
    if (current < steps.length - 1) changeStep(current + 1);
    else handleClose();
  };
  const prev = () => {
    if (current > 0) changeStep(current - 1);
  };
  const skip = () => handleClose();

  // Compute tooltip placement
  const offset = 18;
  const arrowSize = 12;
  const half = arrowSize / 2;
  const [side, align = "center"] = (step.placement || "bottom").split("-") as [
    string,
    string
  ];
  let tipTop = 0;
  let tipLeft = 0;

  switch (side) {
    case "top":
      tipTop = position.top - tooltipSize.height - offset;
      break;
    case "bottom":
      tipTop = position.top + position.height + offset;
      break;
    case "left":
      tipLeft = position.left - tooltipSize.width - offset;
      tipTop = position.top + (position.height - tooltipSize.height) / 2;
      break;
    case "right":
      tipLeft = position.left + position.width + offset;
      tipTop = position.top + (position.height - tooltipSize.height) / 2;
      break;
  }

  if (side === "top" || side === "bottom") {
    if (align === "start") tipLeft = position.left;
    else if (align === "end")
      tipLeft = position.left + position.width - tooltipSize.width;
    else tipLeft = position.left + (position.width - tooltipSize.width) / 2;
  }

  if (side === "left" || side === "right") {
    if (align === "start") tipTop = position.top;
    else if (align === "end")
      tipTop = position.top + position.height - tooltipSize.height;
  }

  // Arrow styling
  const arrowStyle: CSSProperties = {
    position: "absolute",
    width: arrowSize,
    height: arrowSize,
    background: "#fff",
    transform: "rotate(45deg)",
  };
  if (side === "top") arrowStyle.bottom = -half;
  else if (side === "bottom") arrowStyle.top = -half;
  else if (side === "left") arrowStyle.right = -half;
  else arrowStyle.left = -half;

  if (side === "top" || side === "bottom") {
    arrowStyle.left =
      align === "start"
        ? 8
        : align === "end"
        ? tooltipSize.width - 8 - arrowSize
        : tooltipSize.width / 2 - half;
  } else {
    arrowStyle.top =
      align === "start"
        ? 8
        : align === "end"
        ? tooltipSize.height - 8 - arrowSize
        : tooltipSize.height / 2 - half;
  }

  // Portal for backdrop into blur context root
  const blurRoot = document.getElementById("tour-overlay-root");
  const backdropPortal = createPortal(
    <div
      className="fixed inset-0 bg-black h-dvh transition-opacity duration-500 pointer-events-auto"
      style={{ zIndex: 900, opacity: showBackdrop ? 0.5 : 0 }}
      onClick={closeOnBackdropClick ? skip : undefined}
    />,
    blurRoot || document.body
  );

  // Portal for spotlight & tooltip into document.body
  const spotlightPortal = createPortal(
    <div className="fixed inset-0 pointer-events-none">
      <div
        className={`absolute border-4 border-emerald-400 rounded-lg pointer-events-none transition-opacity transition-transform duration-500 ${
          showRing ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
        style={{
          zIndex: 1001,
          top: position.top - 4,
          left: position.left - 4,
          width: position.width + 8,
          height: position.height + 8,
        }}
      />
      <div
        ref={tooltipRef}
        role="tooltip"
        className={`absolute bg-white shadow-lg p-4 rounded max-w-xs pointer-events-auto transition-opacity duration-300 ease-in-out ${
          showTooltip && !isExiting ? "opacity-100" : "opacity-0"
        }`}
        style={{ zIndex: 1002, top: tipTop, left: tipLeft }}
      >
        <span style={arrowStyle} />
        {step.title && (
          <p className="text-sm font-bold text-gray-800 pb-1">{step.title}</p>
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
  );

  return (
    <>
      {backdropPortal}
      {spotlightPortal}
    </>
  );
};
