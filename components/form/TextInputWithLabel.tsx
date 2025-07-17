import React from "react";
import InputWrapper, {
  InputWrapperProps,
  LabelLayout,
} from "../layout/InputWrapper";

type Props = {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  id?: string;
  placeholder?: string;
  selectOnFocus?: boolean;
  block?: boolean;
  size?: number;
  className?: string;
  layout?: LabelLayout;
};

const TextInputWithLabel: React.FC<Props> = ({
  label,
  value,
  onChange,
  onKeyDown,
  id,
  placeholder,
  selectOnFocus,
  block,
  size,
  className,
  layout = "stacked",
}) => {
  const inputId = id || `text-${label.replace(/\s+/g, "-").toLowerCase()}`;
  const useWrapper = label && label !== "";
  // No casts—both Fragment and InputWrapper accept an optional props object + children
  const Container = useWrapper ? InputWrapper : React.Fragment;
  // If InputWrapper needs props, prepare them:
  const wrapperProps: Partial<InputWrapperProps> = useWrapper
    ? {
        label: label,
        layout: layout,
        labelWidthClass: "w-1/4",
      }
    : {};

  return (
    <Container {...wrapperProps}>
      <input
        id={inputId}
        type="text"
        className={`${
          block ? "w-full" : ""
        } h-8 bg-white border border-neutral-300 rounded-xl py-2 px-4 text-neutral-900 text-sm leading-tight focus:outline-hidden focus:bg-white focus:border-purple-500 ${className}`}
        value={value}
        placeholder={placeholder}
        onFocus={selectOnFocus ? (e) => e.target.select() : undefined}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        size={size}
        autoComplete="off"
      />
    </Container>
  );
};

export default TextInputWithLabel;
