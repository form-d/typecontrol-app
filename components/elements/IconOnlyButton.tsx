import React from "react";
import type { ButtonVariant } from "./Button";

export type IconOnlyButtonShape = "square" | "circle";
export type IconOnlyButtonSize = "tiny" | "small" | "standard" | "large";

interface IconOnlyButtonProps {
  /** Accessible label for screen readers */
  ariaLabel: string;
  /** Icon element to display inside the button */
  icon: React.ReactNode;
  /** Visual variant (background/text color) */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: IconOnlyButtonSize;
  /** Shape of the button: square or circle */
  shape?: IconOnlyButtonShape;
  /** Click handler */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Disabled state */
  disabled?: boolean;
  /** Additional Tailwind classes */
  className?: string;
  id?: string;
}

// Reuse variant classes from Button
const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-purple-600 text-white hover:bg-purple-700",
  secondary: "bg-gray-300 text-gray-800 hover:bg-gray-400",
  tertiary: "border border-gray-300 text-gray-800 hover:bg-gray-100",
  text: "bg-transparent text-purple-600 hover:bg-gray-100",
  subtle: "bg-transparent text-gray-500 hover:bg-gray-100",
};

// Map sizes to width/height utilities
const dimensionMap: Record<IconOnlyButtonSize, string> = {
  tiny: "w-5 h-5",
  small: "w-6 h-6",
  standard: "w-8 h-8",
  large: "w-10 h-10",
};

/**
 * IconOnlyButton: a button that displays only an icon.
 * Supports square or circle shapes.
 *
 * @example
 * <IconOnlyButton
 *   ariaLabel="Favorite"
 *   icon={<Icon iconClass="fas fa-heart" />}
 *   variant="secondary"
 *   size="small"
 *   shape="circle"
 *   onClick={handleClick}
 * />
 */
const IconOnlyButton: React.FC<IconOnlyButtonProps> = ({
  ariaLabel,
  icon,
  variant = "primary",
  size = "standard",
  shape = "square",
  onClick,
  disabled = false,
  className = "",
  id,
}) => {
  const vClasses = variantClasses[variant];
  const sizeClass = dimensionMap[size];
  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-md";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      id={id}
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center ${vClasses} ${sizeClass} ${shapeClass} ${disabledClasses} ${className}`.trim()}
      onMouseDown={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* Screen reader description */}
      <span className="sr-only">{ariaLabel}</span>
      {/* Icon */}
      {icon}
    </button>
  );
};

export default IconOnlyButton;
