import React from "react";

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

interface IconProps {
  /** Optional SVG or React node to render */
  children?: React.ReactNode;
  /** Predefined size options */
  size?: IconSize;
  /** Tailwind classes for color, spacing, or additional styling */
  className?: string;
  /** Optional icon font classes (e.g. Font Awesome, Tabler) */
  iconClass?: string;
}

/**
 * Universal Icon component
 * Supports SVG/React icons or font-icon classes, with size presets.
 *
 * Usage with SVG:
 * <Icon size="lg" className="text-neutral-600">
 *   <svg viewBox="0 0 20 20">...</svg>
 * </Icon>
 *
 * Usage with icon fonts:
 * <Icon size="sm" iconClass="fas fa-download" className="text-blue-500" />
 */
const Icon: React.FC<IconProps> = ({
  children,
  size = "md",
  className = "",
  iconClass,
}: IconProps): React.ReactElement => {
  // Size mapping to Tailwind classes
  const sizeMap: Record<IconSize, string> = {
    xs: "w-3 h-3 text-base",
    sm: "w-4 h-4 text-md",
    md: "w-5 h-5 text-xl",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  };
  const sizeClass = sizeMap[size];

  // Combined classes
  const classes = `${sizeClass} ${className}`.trim();

  if (iconClass) {
    // Render font-icon
    return (
      <i
        className={`relative before:absolute before:inset-0 before:flex before:items-center before:justify-center ${iconClass} ${classes}`}
      />
    );
  }

  // Render SVG or React icon node
  return (
    <span className={`inline-flex fill-current ${classes}`.trim()}>
      {children}
    </span>
  );
};

export default Icon;
