import React, { useRef, useEffect } from "react";
import InputWrapper from "../layout/InputWrapper";
import Icon from "../elements/Icon";

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
          className="flex justify-center items-center bg-black/2 dark:bg-white/10 w-10 text-primary dark:hover:bg-white/10 border border-neutral-300 dark:border-neutral-700 rounded-s-xl px-2 h-8 focus:outline-hidden dark:disabled:border-neutral-700 disabled:text-neutral-400 dark:disabled:text-neutral-600 disabled:bg-black/2 dark:disabled:bg-white/10 hover:outline-neutral-400 hover:outline-1 hover:-outline-offset-1"
          disabled={disabled}
        >
          <Icon size="sm" iconClass="ti ti-minus" />
        </button>
        <input
          ref={inputRef}
          id={inputId}
          type="number"
          className="appearance-none dark:bg-white/5 border border-x-0 dark:border-neutral-700 h-8 text-center text-neutral-400 dark:text-white text-sm dark:focus:purple-500 block w-full py-2.5 dark:disabled:border-neutral-700 dark:disabled:bg-white/5 dark:disabled:text-neutral-600 disabled:pointer-events-none dark:hover:outline-neutral-400 hover:outline-1 hover:-outline-offset-1"
          // block appearance-none w-full bg-white border border-neutral-300 hover:border-neutral-400 px-4 py-2 pr-8 rounded leading-tight focus:outline-hidden focus:shadow-outline
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
          className="flex justify-center items-center bg-black/2 dark:bg-white/10 w-10 text-primary dark:hover:bg-white/10 border border-neutral-300 dark:border-neutral-700 rounded-e-xl px-2 h-8 focus:outline-hidden dark:disabled:border-neutral-700 disabled:text-neutral-400 dark:disabled:text-neutral-600 disabled:bg-black/2 dark:disabled:bg-white/10 hover:outline-neutral-400 hover:outline-1 hover:-outline-offset-1"
          disabled={disabled}
        >
          <Icon size="xs" iconClass="ti ti-plus" />
        </button>
      </div>
    </InputWrapper>
  );
};

export default NumberInputWithLabel;
