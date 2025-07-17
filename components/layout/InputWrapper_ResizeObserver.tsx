import React, { ReactNode, useRef, useState, useEffect, FC } from "react";

export type LabelLayout = "stacked" | "left";

export interface InputWrapperProps {
  /** Label text for the input (optional now!) */
  label?: string;
  /** Child input element (or any form control) */
  children?: ReactNode;
  /** Layout for label: stacked (label above) or left-aligned */
  layout?: LabelLayout;
  /** Width of the label column when layout='left' */
  labelWidthClass?: string;
  /** Additional container classes */
  className?: string;
}

/**
 * Automatically forces `stacked` when this wrapper’s width < 400px.
 */
const InputWrapper: FC<InputWrapperProps> = ({
  label = "",
  children = null,
  layout = "stacked",
  labelWidthClass = "w-1/4",
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [effectiveLayout, setEffectiveLayout] = useState<LabelLayout>(layout);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        if (width < 400) {
          setEffectiveLayout("stacked");
        } else {
          setEffectiveLayout(layout);
        }
      }
    });

    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, [layout]);

  // now render based on effectiveLayout:
  if (effectiveLayout === "left") {
    return (
      <div
        ref={containerRef}
        className={`flex items-start mb-2 ${className}`.trim()}
      >
        <label
          className={`${labelWidthClass} pr-4 pt-1.5 text-xs md:text-[11px] lg:text-[11px] 3xl:text-[11px] font-bold text-neutral-700 justify-start leading-tight`}
        >
          {label}
        </label>
        <div className="flex-1 min-h-2">{children}</div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex flex-col mb-2 ${className}`.trim()}
    >
      <label className="mb-2 pt-1.5 text-xs font-bold text-neutral-700">
        {label}
      </label>
      {children}
    </div>
  );
};

export default InputWrapper;
