import React from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

/**
 * Toggle switch component
 *
 * Usage:
 * <Switch checked={enabled} onChange={setEnabled} label="Use setting" />
 */
const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  label,
  className = "",
}) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`inline-flex relative items-center ${
        checked ? "bg-primary" : "bg-neutral-300"
      } h-6 w-11 px-0.5 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 ${className}`}
    >
      {label && <span className="sr-only">{label}</span>}

      <span
        aria-hidden="true"
        className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      >
        {/* Cross icon */}
        <span
          aria-hidden
          className={`${
            checked ? "invisible" : "flex"
          } items-center justify-center inset-x-0 size-full absolute`}
        >
          <svg
            fill="none"
            viewBox="0 0 12 12"
            className="w-3 h-3 text-neutral-500"
          >
            <path
              d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        {/* Check icon */}
        <span
          aria-hidden
          className={`${
            checked ? "flex" : "invisible"
          } items-center justify-center inset-x-0 size-full absolute`}
        >
          <svg
            fill="currentColor"
            viewBox="0 0 12 12"
            className="w-3 h-3 text-neutral-500"
          >
            <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
          </svg>
        </span>
      </span>
    </button>
  );
};

export default Switch;
