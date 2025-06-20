import React from "react";

interface DividerProps {
  /** Orientation of the divider: horizontal or vertical */
  orientation?: "horizontal" | "vertical";
  /** Predefined color options */
  color?: "light" | "medium" | "dark";
  /** Custom Tailwind color class (overrides `color`) */
  customColorClass?: string;
  /** Predefined thickness options */
  thickness?: "thin" | "medium" | "thick";
  /** Custom Tailwind thickness class (overrides `thickness`) */
  customThicknessClass?: string;
  /** Predefined spacing options around the divider */
  spacing?: "none" | "dense" | "medium" | "large";
  /** Custom Tailwind spacing class (overrides `spacing`) */
  customSpacingClass?: string;
  /** Additional Tailwind classes */
  className?: string;
}

/**
 * Universal Divider Component with predefined color, thickness, and spacing options
 *
 * Usage:
 * <Divider />
 * <Divider orientation="vertical" color="dark" thickness="medium" spacing="dense" />
 * <Divider customColorClass="bg-red-500" customThicknessClass="h-2" customSpacingClass="my-2" />
 */
const Divider: React.FC<DividerProps> = ({
  orientation = "horizontal",
  color = "light",
  customColorClass,
  thickness = "thin",
  customThicknessClass,
  spacing = "medium",
  customSpacingClass,
  className = "",
}) => {
  // Predefined color mapping
  const colorMap: Record<"light" | "medium" | "dark", string> = {
    light: "bg-gray-200",
    medium: "bg-gray-500",
    dark: "bg-gray-800",
  };
  const colorClass = customColorClass ?? colorMap[color];

  // Predefined thickness mapping
  const thicknessMap: Record<
    "horizontal" | "vertical",
    Record<"thin" | "medium" | "thick", string>
  > = {
    horizontal: { thin: "h-px", medium: "h-1", thick: "h-2" },
    vertical: { thin: "w-px", medium: "w-1", thick: "w-2" },
  };
  const thicknessClass =
    customThicknessClass ?? thicknessMap[orientation][thickness];

  // Predefined spacing mapping
  const spacingMap: Record<
    "horizontal" | "vertical",
    Record<"none" | "dense" | "medium" | "large", string>
  > = {
    horizontal: { none: "my-0", dense: "my-2", medium: "my-4", large: "my-8" },
    vertical: { none: "mx-0", dense: "mx-2", medium: "mx-4", large: "mx-8" },
  };
  const spacingClass = customSpacingClass ?? spacingMap[orientation][spacing];

  // Flex behavior
  const flexClass = orientation === "horizontal" ? "w-full" : "h-full";

  return (
    <div
      className={`${spacingClass} ${flexClass} ${thicknessClass} ${colorClass} flex-shrink-0 flex-grow-0 ${className}`}
    />
  );
};

export default Divider;
