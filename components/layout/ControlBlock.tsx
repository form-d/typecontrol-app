import React from "react";

interface ControlBlockProps {
  /** Main label/title for the control */
  title: string;
  /** Optional secondary description text */
  description?: React.ReactNode;
  /** The control element to render, e.g. a Switch, Select, Input, etc. */
  control: React.ReactNode;
  /** Additional Tailwind classes for customization */
  className?: string;
}

/**
 * A generic wrapper for a single control in a settings view.
 * Renders title, optional description, and any React node as control.
 *
 * Usage:
 * <ControlBlock
 *   title="Enable Feature"
 *   description="Toggle this to activate the feature"
 *   control={<Switch checked={enabled} onChange={setEnabled} />}
 * />
 */
const ControlBlock: React.FC<ControlBlockProps> = ({
  title,
  description,
  control,
  className = "",
}): React.ReactElement => {
  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-neutral-900">{title}</span>
        {description && (
          <span className="mt-0.5 text-xs text-neutral-500">{description}</span>
        )}
      </div>
      <div className="self-start">{control}</div>
    </div>
  );
};

export default ControlBlock;
