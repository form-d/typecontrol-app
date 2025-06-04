// InputWrapper.tsx
// leranings:
// tailwind and container queries does not work for does not work for now. TW does not recognize this part `@min-[400px]:${labelWidthClass}
import React, { ReactNode } from "react";

export type LabelLayout = "stacked" | "left";

export interface InputWrapperProps {
  label?: string;
  children?: ReactNode;
  layout?: LabelLayout;
  labelWidthClass?: string;
  className?: string;
}

const InputWrapper: React.FC<InputWrapperProps> = ({
  label = "",
  children = null,
  layout = "stacked",
  labelWidthClass,
  className = "",
}) => {
  const isLeft = layout === "left";

  // Put  entire string  in the source code, so TailwindCSS will know to generate the applicable CSS.
  // @min-[540px]:w-1/2 @min-[540px]:w-2/5 @min-[540px]:w-1/3 @min-[540px]:w-1/4 @min-[540px]:w-1/5 @min-[540px]:w-1/6
  const minLabelWidthClass = labelWidthClass
    ? "@min-[540px]:" + labelWidthClass
    : "@min-[540px]:w-1/4";

  // const isLeft = true;

  return (
    <div className={`@container mb-2 ${className}`}>
      <div
        className={`
          flex 
          ${
            isLeft ? "flex-col @min-[540px]:flex-row gap-1.5 " : "flex-col"
          }              
        `}
      >
        {isLeft ? (
          <label
            className={`${minLabelWidthClass} pr-4 pt-1.5 text-xs font-bold text-gray-700`}
          >
            {label}
          </label>
        ) : (
          <label className="mb-2 pt-1.5 text-xs font-bold text-gray-700">
            {label}
          </label>
        )}
        <div className="flex-1 w-full">{children}</div>
      </div>
    </div>
  );
};

export default InputWrapper;
