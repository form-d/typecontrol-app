import React, { useRef, useState, useEffect } from "react";
import InputWrapper from "../layout/InputWrapper";

interface CustomSliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  disabled?: boolean;
  onDisabledDoubleClick?: () => void;
  unitTextAlign?: "left" | "center" | "right";
  /**
   * Number of decimal places to display after the comma
   * @default 3
   */
  precision?: number;
  /**
   * Show step markers along the track
   */
  showSteps?: boolean;
}

const CustomSlider = ({
  label,
  min,
  max,
  step,
  value,
  onChange,
  unit,
  disabled = false,
  onDisabledDoubleClick,
  precision = 0,
  unitTextAlign = "right",
  showSteps = false,
}: CustomSliderProps): React.ReactElement => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [intent, setIntent] = useState<null | "horizontal" | "vertical">(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);

  const percent = ((value - min) / (max - min)) * 100;

  const alignmentClassMap: Record<"left" | "center" | "right", string> = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  // Utility to get clientX from Mouse or Touch event
  function getClientX(
    e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent
  ): number {
    // Touch events (move/start)
    if ("touches" in e && e.touches.length > 0) {
      return e.touches[0].clientX;
    }
    // Touch end (changedTouches)
    if ("changedTouches" in e && (e as TouchEvent).changedTouches.length > 0) {
      return (e as TouchEvent).changedTouches[0].clientX;
    }
    // Mouse events
    if ("clientX" in e) {
      return (e as MouseEvent | React.MouseEvent).clientX;
    }
    return 0;
  }

  const updateValue = (clientX: number) => {
    if (!trackRef.current || disabled) return;
    const { left, width } = trackRef.current.getBoundingClientRect();
    let px = clientX - left;
    px = Math.max(0, Math.min(px, width));
    const newValue =
      min + Math.round(((px / width) * (max - min)) / step) * step;
    onChange(parseFloat(newValue.toFixed(5)));
  };

  // --- Mouse handlers ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setDragging(true);
    updateValue(e.clientX);
  };
  const handleMouseMove = (e: MouseEvent) => {
    if (dragging) updateValue(e.clientX);
  };
  const handleMouseUp = () => setDragging(false);

  // --- Touch handlers ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    const touch = e.touches[0];
    setIntent(null);
    startPos.current = { x: touch.clientX, y: touch.clientY };
    setDragging(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!dragging || !startPos.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - startPos.current.x);
    const dy = Math.abs(touch.clientY - startPos.current.y);

    if (intent === null) {
      if (dx > 8 || dy > 8) {
        if (dx > dy) {
          setIntent("horizontal");
          updateValue(touch.clientX);
        } else {
          setIntent("vertical");
        }
      }
    } else if (intent === "horizontal") {
      updateValue(touch.clientX);
      e.preventDefault(); // Prevent scroll
    }
    // If vertical, do nothing
  };

  const handleTouchEnd = () => setDragging(false);

  // Attach event listeners for dragging
  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [dragging]);

  // handler for double-clicks on the wrapper
  const handleDoubleClick = () => {
    if (disabled && onDisabledDoubleClick) {
      onDisabledDoubleClick();
    }
  };

  return (
    <div className="" onDoubleClick={handleDoubleClick}>
      <InputWrapper label={label} layout="left" labelWidthClass="w-1/4">
        <div className="flex gap-3 items-center pt-1">
          <div className="select-none mt-px w-full">
            <div
              ref={trackRef}
              className={`relative h-1 rounded-full ${
                disabled ? "bg-white/10" : "bg-white/15 cursor-pointer"
              } before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-6 before:bg-transparent before:rounded-full`}
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              {/* Track fill */}
              <div
                className={`absolute glow top-0 left-0 h-1 rounded-full ${
                  disabled ? "bg-neutral-500" : "bg-purple-500"
                }`}
                style={{ width: `${percent}%` }}
              />

              {/* Step Markers */}
              {showSteps &&
                Array.from({
                  length: Math.floor((max - min) / step) + 1,
                }).map((_, i) => {
                  const stepValue = min + i * step;
                  const left = ((stepValue - min) / (max - min)) * 100;
                  return (
                    <div
                      key={i}
                      className="absolute top-1/2 w-[2px] h-2 bg-white/40 -translate-y-1/2 rounded-full"
                      style={{ left: `${left}%` }}
                    />
                  );
                })}

              {/* Slider Thumb */}
              <div
                className={`absolute glow top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-0 ${
                  disabled
                    ? "bg-neutral-500 border-neutral-500"
                    : "bg-purple-500 border-purple-500 cursor-grab"
                } before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-10 before:h-10 before:bg-transparent before:rounded-full`}
                style={{ left: `${percent}%` }}
              />
            </div>
          </div>
          <div>
            <div
              className={`text-sm w-12 ${alignmentClassMap[unitTextAlign]} ${
                disabled ? "text-neutral-600" : "text-white/80"
              }`}
            >
              {value.toFixed(precision)}
              {unit || ""}
            </div>
          </div>
        </div>
      </InputWrapper>
    </div>
  );
};

export default CustomSlider;
