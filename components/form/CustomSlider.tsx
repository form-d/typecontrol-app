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
  /**
   * Number of decimal places to display after the comma
   * @default 3
   */
  precision?: number;
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
}: CustomSliderProps): React.ReactElement => {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const percent = ((value - min) / (max - min)) * 100;

  const updateValue = (clientX: number) => {
    if (!trackRef.current || disabled) return;
    const { left, width } = trackRef.current.getBoundingClientRect();
    let px = clientX - left;
    px = Math.max(0, Math.min(px, width));
    const newValue =
      min + Math.round(((px / width) * (max - min)) / step) * step;
    onChange(parseFloat(newValue.toFixed(5)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    setDragging(true);
    updateValue(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragging) updateValue(e.clientX);
  };

  const handleMouseUp = () => setDragging(false);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
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
                disabled ? "bg-gray-200" : "bg-black/10 cursor-pointer"
              }`}
              onMouseDown={handleMouseDown}
            >
              <div
                className={`absolute top-0 left-0 h-1 rounded-full ${
                  disabled ? "bg-gray-400" : "bg-purple-500"
                }`}
                style={{ width: `${percent}%` }}
              />
              <div
                className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full border ${
                  disabled
                    ? "bg-gray-100 border-gray-400"
                    : "bg-white border-purple-500 cursor-grab"
                }`}
                style={{
                  left: `${percent}%`,
                  // transform: "translate(-50%, -50%)",
                }}
              />
            </div>
          </div>
          <div>
            <div
              className={`text-sm w-12 text-right ${
                disabled ? "text-gray-400" : "text-black"
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
