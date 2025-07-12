import React, { useState, useRef, useEffect, ReactNode, Fragment } from "react";
import { createPortal } from "react-dom";
import InputWrapper, { InputWrapperProps } from "../layout/InputWrapper";
import Tooltip from "../elements/Tooltip";
import { useFloatingDropdown } from "../../hooks/useFloatingDropdown";
import { Transition } from "@headlessui/react";

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

  // const containerRef = useRef<HTMLDivElement>(null);

  const { open, setOpen, floatingProps, referenceProps, pointerTrap } =
    useFloatingDropdown({
      offsetPx: 8,
    });

  const handleSelect = (item: string) => {
    onChange(item);
    setOpen(false);
  };

  return (
    <Container {...wrapperProps}>
      <div className="relative">
        <div
          {...referenceProps}
          className={`inline-flex items-stretch bg-white/5 border border-neutral-700 rounded-xl overflow-hidden hover:border-gray-400 ${
            block ? "w-full" : ""
          } ${className ?? ""}`}
        >
          {/* Text input */}
          <input
            id={inputId}
            type="text"
            className="grow h-8 px-4 py-2 text-white/80 text-sm border-none leading-tight focus:outline-hidden"
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
              className="flex-none px-2 py-2 border-l border-neutral-700 rounded-e-xl h-8 bg-white/5 hover:bg-white/15 focus-visible:border-purple-500 focus-visible:ring-2 focus:outline-hidden"
              onClick={() => setOpen((open) => !open)}
              aria-haspopup="true"
              aria-expanded={open}
            >
              {/* <ChevronDown size={16} /> */}
              <div className="pointer-events-none px-0 text-purple-400">
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
          {/* Render pointerTrap before dropdown */}
          {pointerTrap}
          {/* Dropdown menu */}
          {createPortal(
            <Transition
              as={Fragment}
              show={open}
              enter="transition-opacity duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-150"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ul
                {...floatingProps}
                className="w-full bg-white border border-gray-200 rounded-sm shadow-xl z-10 max-h-60 overflow-auto"
              >
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
            </Transition>,
            document.body
          )}
        </div>
      </div>
    </Container>
  );
};

export default TextInputWithDropdown;
