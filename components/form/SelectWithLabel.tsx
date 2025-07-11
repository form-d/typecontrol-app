import React from "react";
import InputWrapper, { InputWrapperProps } from "../layout/InputWrapper";

type Option = {
  label: string;
  value: string;
};

// Group of options under a label
export type OptionGroup = {
  label: string;
  options: Option[];
};

// Union type: either a single option or a group
export type OptionOrGroup = Option | OptionGroup;

type Props = {
  label?: string;
  // Accept either flat options or grouped options
  options: OptionOrGroup[];
  value: string;
  onChange: (value: string) => void;
  id?: string;
  disabled?: boolean;
};

const SelectWithLabel: React.FC<Props> = ({
  label,
  options,
  value,
  onChange,
  id,
  disabled = false,
}) => {
  const selectId =
    id || `select-${(label ?? "").replace(/\s+/g, "-").toLowerCase()}`;

  // Determine whether an item is a group
  const isGroup = (item: OptionOrGroup): item is OptionGroup => {
    return (item as OptionGroup).options !== undefined;
  };

  const useWrapper = label && label !== "";
  // No casts—both Fragment and InputWrapper accept an optional props object + children
  const Container = useWrapper ? InputWrapper : React.Fragment;
  // If InputWrapper needs props, prepare them:
  const wrapperProps: Partial<InputWrapperProps> = useWrapper
    ? {
        label: label,
        layout: "left",
        labelWidthClass: "w-1/4",
      }
    : {};

  return (
    <Container {...wrapperProps}>
      <div className="inline-block relative">
        <select
          id={selectId}
          className="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-1 pr-7 h-8 rounded-xl text-sm leading-tight focus:outline-hidden focus:shadow-outline disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 disabled:shadow-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        >
          {options.map((opt, i) =>
            isGroup(opt) ? (
              <optgroup key={i} label={opt.label}>
                {opt.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </optgroup>
            ) : (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            )
          )}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-purple-500">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
          </svg>
        </div>
      </div>
    </Container>
  );
};

export default SelectWithLabel;
