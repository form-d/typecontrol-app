import React from "react";

type Props = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id?: string;
};

const CheckboxWithLabel: React.FC<Props> = ({
  checked,
  onChange,
  label,
  id,
}) => {
  const inputId = id || `checkbox-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="relative w-full flex gap-2 text-xs items-center text-black/80 dark:text-white/80">
      <div className="relative flex items-center justify-center w-4 h-4">
        <input
          className="
          peer relative appearance-none shrink-0 w-4 h-4 border-0 border-black-100 rounded-md mt-1 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20
          focus:outline-hidden focus:ring-offset-0 :focus-visible:ring-1 :focus-visible:ring-blue-100
          checked:bg-primary checked:hover:bg-primary-dark checked:border-0
          disabled:border-steel-400 disabled:bg-steel-400 before:absolute before:left-1/2 before:top-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-10 before:h-10 before:bg-transparent before:rounded-full
        "
          type="checkbox"
          id={inputId}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <svg
          className="absolute w-3.5 h-3.5 pointer-events-none hidden peer-checked:block stroke-black mt-1 outline-hidden"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <label htmlFor={inputId} className="pt-[0.25em]">
        {label}
      </label>
    </div>
  );
};

export default CheckboxWithLabel;
