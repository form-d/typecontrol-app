import React from "react";
import Switch from "../form/Switch";

interface SwitchFieldProps {
  /** Title or main label displayed above the description */
  title: string;
  /** Optional descriptive text shown below the title */
  description?: string;
  /** Current switch state */
  checked: boolean;
  /** Callback when switch toggles */
  onChange: (checked: boolean) => void;
  /** Additional classes for the container */
  className?: string;
}

/**
 * A switch control with a title and optional description.
 * Layout: Title and description on the left, switch on the right.
 *
 * Usage:
 * <SwitchField
 *   title="Enable Notifications"
 *   description="Receive email notifications for updates"
 *   checked={enabled}
 *   onChange={setEnabled}
 * />
 */
const SwitchField: React.FC<SwitchFieldProps> = ({
  title,
  description,
  checked,
  onChange,
  className = "",
}): React.ReactElement => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex flex-col grow">
        <span className="text-sm font-medium text-gray-900">{title}</span>
        {description && (
          <span className="mt-1 text-xs text-gray-500">{description}</span>
        )}
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
};

export default SwitchField;
