import React, { useState, useRef, useEffect, ReactNode } from "react";
import InputWrapper, { InputWrapperProps } from "../layout/InputWrapper";
import Tooltip from "../elements/Tooltip";
// import { ChevronDown } from "react-feather"; // or your preferred icon library

interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  selectOnFocus?: boolean;
  block?: boolean;
  size?: number;
  className?: string;
  options: string[]; // list of dropdown items
  optionRenderer?: (item: string) => ReactNode; // optional custom render
  tooltipContent?: string;
}

const TextInputWithDropdown: React.FC<Props> = ({
  label,
  value,
  onChange,
  id,
  placeholder,
  selectOnFocus = true,
  block,
  size,
  className,
  options,
  optionRenderer,
  tooltipContent,
}) => {
  const inputId = id || `text-${label?.replace(/\s+/g, "-").toLowerCase()}`;
  const useWrapper = !!label;
  const Container = useWrapper ? InputWrapper : React.Fragment;
  const wrapperProps: Partial<InputWrapperProps> = useWrapper
    ? { label, layout: "stacked", labelWidthClass: "w-1/4" }
    : {};

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (item: string) => {
    onChange(item);
    setIsOpen(false);
  };

  return (
    <Container {...wrapperProps}>
      <div className="relative">
        <div
          ref={containerRef}
          className={`inline-flex items-stretch bg-white border border-gray-300 rounded-lg overflow-hidden ${
            block ? "w-full" : ""
          } ${className ?? ""}`}
        >
          {/* Text input */}
          <input
            id={inputId}
            type="text"
            className="grow h-8 px-4 py-2 text-gray-900 text-sm border-none leading-tight focus:outline-hidden focus:border-purple-500"
            value={value}
            placeholder={placeholder}
            onFocus={
              selectOnFocus ? (e) => e.currentTarget.select() : undefined
            }
            onChange={(e) => onChange(e.target.value)}
            size={size}
            autoComplete="off"
          />
          {/* Dropdown toggle */}
          <Tooltip
            content={tooltipContent}
            placement="top"
            enabled={!!tooltipContent && tooltipContent.trim().length > 0}
          >
            <button
              type="button"
              className="flex-none px-1.5 py-2 border-l border-gray-300 rounded-e-lg h-8 focus-visible:border-purple-500 focus-visible:ring-2 focus:outline-hidden"
              onClick={() => setIsOpen((open) => !open)}
              aria-haspopup="true"
              aria-expanded={isOpen}
            >
              {/* <ChevronDown size={16} /> */}
              <div className="pointer-events-none px-0 text-purple-500">
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </button>
          </Tooltip>
          {/* Dropdown menu */}
          {isOpen && (
            <ul className="absolute left-0 mt-10 w-full bg-white border border-gray-200 rounded-sm shadow-lg z-10 max-h-60 overflow-auto">
              {options.map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => handleSelect(item)}
                  >
                    {optionRenderer ? optionRenderer(item) : item}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Container>
  );
};

export default TextInputWithDropdown;
