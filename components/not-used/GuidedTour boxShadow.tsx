"use client";

import React, {
  useState,
  useEffect,
  useRef,
  ReactNode,
  CSSProperties,
} from "react";
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
  /** Tooltip placement relative to the target */
  placement?: Placement;
};

type GuidedTourProps = {
  /** Steps defining the tour */
  steps: TourStep[];
  /** Called when tour finishes or is skipped */
  onClose?: () => void;
  /** Clicking the overlay closes the tour */
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
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipSize, setTooltipSize] = useState({ width: 0, height: 0 });

  // animation states
  const [showOverlay, setShowOverlay] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const step = steps[current];

  // initial fade-in
  useEffect(() => {
    setShowOverlay(true);
    const tipTimer = setTimeout(() => setShowTooltip(true), 300);
    return () => clearTimeout(tipTimer);
  }, []);

  // Elevate target and compute spotlight position
  useEffect(() => {
    const el = document.querySelector(step.target) as HTMLElement | null;
    if (!el) return;
    const origZ = el.style.zIndex;
    const origPos = el.style.position;
    if (getComputedStyle(el).position === "static")
      el.style.position = "relative";
    el.style.zIndex = "1000";
    const rect = el.getBoundingClientRect();
    setPosition({
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
    });
    return () => {
      el.style.zIndex = origZ;
      el.style.position = origPos;
    };
  }, [current, step.target]);

  // measure tooltip
  useEffect(() => {
    if (!tooltipRef.current) return;
    const rect = tooltipRef.current.getBoundingClientRect();
    setTooltipSize({ width: rect.width, height: rect.height });
  }, [current, showTooltip]);

  const handleClose = () => {
    setIsExiting(true);
    setShowTooltip(false);
    setTimeout(() => {
      setShowOverlay(false);
      setTimeout(() => onClose?.(), 300);
    }, 300);
  };

  const changeStep = (i: number) => {
    setShowTooltip(false);
    // do not toggle overlay to keep it static
    setCurrent(i);
    setShowTooltip(true);
  };

  const next = () =>
    current < steps.length - 1 ? changeStep(current + 1) : handleClose();
  const skip = () => handleClose();

  // tooltip placement
  const offset = 18;
  const arrowSize = 12;
  const half = arrowSize / 2;
  const [side, align = "center"] = (step.placement || "bottom").split("-") as [
    string,
    string
  ];
  let tipTop = 0,
    tipLeft = 0;
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

  // arrow styling
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
  if (side === "top" || side === "bottom")
    arrowStyle.left =
      align === "start"
        ? 8
        : align === "end"
        ? tooltipSize.width - 8 - arrowSize
        : tooltipSize.width / 2 - half;
  else
    arrowStyle.top =
      align === "start"
        ? 8
        : align === "end"
        ? tooltipSize.height - 8 - arrowSize
        : tooltipSize.height / 2 - half;

  return (
    <>
      {/* Transparent fullscreen overlay blocking interactions */}
      <div
        className={`fixed inset-0 pointer-events-auto transition-opacity duration-500 ${
          showOverlay ? "opacity-100" : "opacity-0"
        }`}
        style={{ background: "transparent" }}
        onClick={closeOnOverlayClick ? skip : undefined}
      />

      {/* Shadow overlay highlighting the target; static, only box-shadow transitions */}
      <div
        className="fixed pointer-events-none transition-shadow duration-500 rounded-md"
        style={{
          top: position.top,
          left: position.left,
          width: position.width,
          height: position.height,
          boxShadow: "0 0 0 max(100vh, 100vw) rgba(0, 0, 0, 0.3)",
        }}
      />

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        role="tooltip"
        className={`fixed bg-white shadow-lg p-4 rounded-md max-w-xs pointer-events-auto transition-opacity duration-300 ease-in-out ${
          showTooltip && !isExiting ? "opacity-100" : "opacity-0"
        }`}
        style={{ top: tipTop, left: tipLeft }}
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
    </>
  );
};
