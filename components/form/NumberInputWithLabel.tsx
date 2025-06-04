import React, { useRef, useEffect } from "react";
import InputWrapper from "../layout/InputWrapper";

interface NumberInputWithLabelProps {
  hold?: boolean;
  accelerateHold?: boolean;
  label: string;
  value: number;
  onChange: (value: number) => void;
  id?: string;
  step?: number;
  min?: number;
  max?: number;
  selectOnFocus?: boolean;
  disabled?: boolean;
}

const NumberInputWithLabel = ({
  hold = false,
  accelerateHold = false,
  label,
  value,
  onChange,
  id,
  step = 1,
  min,
  max,
  selectOnFocus = false,
  disabled = false,
}: NumberInputWithLabelProps): React.ReactElement => {
  const inputId = id || `number-${label.replace(/\s+/g, "-").toLowerCase()}`;

  // Live ref to avoid stale closures
  const live = useRef({ value, step, min, max, onChange });
  useEffect(() => {
    live.current = { value, step, min, max, onChange };
  }, [value, step, min, max, onChange]);

  const handleDecrease = () => {
    const { value: v, step: s, min: mn, onChange: oc } = live.current;
    const newValue = v - s;
    if (mn === undefined || newValue >= mn) oc(newValue);
  };

  const handleIncrease = () => {
    const { value: v, step: s, max: mx, onChange: oc } = live.current;
    const newValue = v + s;
    if (mx === undefined || newValue <= mx) oc(newValue);
  };

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const startHolding = (fn: () => void) => {
    // always perform one step on hold
    fn();
    if (!hold) return;
    let delay = 300;
    let counter = 0;
    const stepFunction = () => {
      counter++;
      fn();
      if (accelerateHold && counter % 5 === 0 && delay > 150) {
        delay -= 50;
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = setInterval(stepFunction, delay);
        }
      }
    };
    intervalRef.current = setInterval(stepFunction, delay);
  };

  const stopHolding = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <InputWrapper label={label} layout="left" labelWidthClass="w-1/4">
      <div className="relative flex items-center max-w-28">
        <button
          type="button"
          onMouseDown={() => startHolding(handleDecrease)}
          onMouseUp={stopHolding}
          onMouseLeave={stopHolding}
          className="bg-gray-100/30 text-gray-900 dark:bg-gray-700 hover:bg-gray-200 border border-gray-300 rounded-s-lg px-2 h-8 focus:ring-gray-100 dark:focus:ring-gray-700 focus:ring-2 focus:outline-hidden disabled:border-gray-200 disabled:text-gray-500 disabled:bg-gray-50"
          disabled={disabled}
        >
          <svg
            className="w-3 h-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 18 2"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1h16"
            />
          </svg>
        </button>
        <input
          ref={inputRef}
          id={inputId}
          type="number"
          className="appearance-none bg-white border border-x-0 border-gray-300 h-8 text-center text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full py-2.5 disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 disabled:pointer-events-none"
          // block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded leading-tight focus:outline-hidden focus:shadow-outline
          value={value}
          step={step}
          min={min}
          max={max}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              inputRef.current?.blur();
            }
          }}
          // onFocus={
          //   selectOnFocus && !disabled ? (e) => e.target.select() : undefined
          // }
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
        />

        <button
          type="button"
          onMouseDown={() => startHolding(handleIncrease)}
          onMouseUp={stopHolding}
          onMouseLeave={stopHolding}
          className="bg-gray-100/30 text-gray-900 hover:bg-gray-200 border border-gray-300 rounded-e-lg px-2 h-8 focus:ring-gray-100 focus:ring-2 focus:outline-hidden disabled:border-gray-200 disabled:text-gray-500 disabled:bg-gray-50"
          disabled={disabled}
        >
          <svg
            className="w-3 h-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 18 18"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 1v16M1 9h16"
            />
          </svg>
        </button>
      </div>
    </InputWrapper>
  );
};

export default NumberInputWithLabel;
