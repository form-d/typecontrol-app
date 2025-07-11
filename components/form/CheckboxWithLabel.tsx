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
    <div className="w-full flex gap-2 text-xs items-center">
      <input
        className="
          peer relative appearance-none shrink-0 w-4 h-4 border-2 border-gray-300 rounded-md mt-1 bg-white
          focus:outline-hidden focus:ring-offset-0 :focus-visible:ring-1 :focus-visible:ring-blue-100
          checked:bg-purple-500 checked:border-0
          disabled:border-steel-400 disabled:bg-steel-400
        "
        type="checkbox"
        id={inputId}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <svg
        className="absolute w-4 h-4 pointer-events-none hidden peer-checked:block stroke-white mt-1 outline-hidden"
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
      <label htmlFor={inputId} className="pt-[0.25em]">
        {label}
      </label>
    </div>
  );
};

export default CheckboxWithLabel;
