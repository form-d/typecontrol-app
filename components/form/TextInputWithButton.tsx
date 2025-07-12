import React, { ReactNode } from "react";
import InputWrapper, { InputWrapperProps } from "../layout/InputWrapper";
import Tooltip from "../elements/Tooltip";

interface Props {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  id?: string;
  placeholder?: string;
  selectOnFocus?: boolean;
  block?: boolean;
  size?: number;
  className?: string;

  /** legacy “disable everything” */
  disabled?: boolean;
  /** only disable the text‐input */
  inputDisabled?: boolean;
  /** only disable the button */
  buttonDisabled?: boolean;

  tooltipContent: string;
}

const TextInputWithDropdown: React.FC<Props> = ({
  label,
  value,
  onChange,
  onClick,
  id,
  placeholder,
  selectOnFocus = true,
  block,
  size,
  className,
  disabled = false,
  inputDisabled = false,
  buttonDisabled = false,
  tooltipContent,
}) => {
  const inputId = id || `text-${label?.replace(/\s+/g, "-").toLowerCase()}`;
  const useWrapper = !!label;
  const Container = useWrapper ? InputWrapper : React.Fragment;
  const wrapperProps: Partial<InputWrapperProps> = useWrapper
    ? { label, layout: "stacked", labelWidthClass: "w-1/4" }
    : {};

  // combine legacy + per‐control flags
  const inputIsDisabled = disabled || inputDisabled;
  const buttonIsDisabled = disabled || buttonDisabled;

  // only show tooltip if the button is actually enabled
  const isTooltipEnabled =
    !buttonIsDisabled && !!(tooltipContent && tooltipContent.trim());

  return (
    <Container {...wrapperProps}>
      <div className="relative">
        <div
          className={`inline-flex items-stretch bg-white/5 rounded-xl ${
            block ? "w-full" : ""
          } ${className ?? ""}`}
        >
          {/* Text input */}
          <input
            id={inputId}
            type="text"
            className={`
              grow h-8 px-4 py-2 text-white/80 text-sm border border-neutral-700 
              rounded-s-xl leading-tight focus:outline-hidden focus:border-purple-500
              disabled:border-neutral-700 disabled:bg-gray/50 disabled:text-neutral-600 disabled:shadow-none
              hover:border-gray-400
            `}
            value={value}
            placeholder={placeholder}
            onFocus={
              selectOnFocus && !inputIsDisabled
                ? (e) => e.currentTarget.select()
                : undefined
            }
            onChange={(e) => onChange(e.target.value)}
            size={size}
            autoComplete="off"
            disabled={inputIsDisabled}
          />

          {/* Dropdown toggle */}
          <Tooltip
            content={tooltipContent}
            placement="top"
            enabled={isTooltipEnabled}
          >
            <button
              type="button"
              className={`
                flex-none px-2.5 py-1.5 border-y border-r border-neutral-700 
                rounded-e-xl h-8 bg-white/5 focus-visible:border-purple-500 focus-visible:ring-2 
                focus:outline-hidden hover:bg-white/10
                disabled:border-neutral-700 disabled:bg-white/5 disabled:text-neutral-600
                text-purple-400
              `}
              onClick={onClick}
              disabled={buttonIsDisabled}
            >
              <div className="pointer-events-none px-0">
                <i className="ti ti-fold-down h-4 w-4 fill-current"></i>
              </div>
            </button>
          </Tooltip>
        </div>
      </div>
    </Container>
  );
};

export default TextInputWithDropdown;
