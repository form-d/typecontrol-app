import React, { ReactNode, useState, useRef, useEffect } from "react";
import Tooltip, { Placement } from "../elements/Tooltip";

/**
 * A generic dropdown menu component with tooltip and click-outside behavior.
 *
 * @param tooltip - Text to display in the Tooltip for the trigger.
 * @param placement - Tooltip placement (e.g. 'bottom-end').
 * @param enabled - Whether the Tooltip is enabled when closed.
 * @param trigger - The ReactNode (e.g. Button or Icon) that opens the menu.
 * @param menuClassName - Additional classNames for styling the dropdown panel.
 * @param items - Array of menu items to render.
 *
 * ```tsx
 * // Example usage:
 * import DropdownMenu, { MenuItem } from './DropdownMenu';
 * import IconOnlyButton from '../elements/IconOnlyButton';
 * import Icon from '../elements/Icon';
 *
 * const items: MenuItem[] = [
 *   { label: 'Option A', onClick: () => console.log('A'), active: false },
 *   { label: 'Option B', onClick: () => console.log('B'), disabled: true, helperText: 'Unavailable' },
 * ];
 *
 * <DropdownMenu
 *   tooltip="Open menu"
 *   placement="bottom-start"
 *   enabled={true}
 *   trigger={<IconOnlyButton icon={<Icon iconClass="ti ti-menu" />} />}
 *   items={items}
 * />
 * ```
 */

export interface MenuItem {
  /** Text label for the menu item */
  label: string;
  /** Callback when this item is clicked */
  onClick: () => void;
  /** whether to visually highlight this item */
  active?: boolean;
  /** disable interaction */
  disabled?: boolean;
  /** optional helper text shown below the label */
  helperText?: string;
}

interface DropdownMenuProps {
  tooltip: string;
  placement?: Placement;
  enabled?: boolean;
  trigger: ReactNode;
  menuClassName?: string;
  items: MenuItem[];
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({
  tooltip,
  placement = "bottom-end",
  enabled = true,
  trigger,
  menuClassName = "absolute right-0 mt-2 w-56 bg-white border rounded-sm shadow-lg z-30",
  items,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative inline-block" ref={ref}>
      <Tooltip
        content={tooltip}
        placement={placement}
        enabled={enabled && !open}
      >
        <div onClick={() => setOpen((o) => !o)} className="inline-block">
          {trigger}
        </div>
      </Tooltip>

      {open && (
        <div className={menuClassName}>
          {items.map((item, idx) => (
            <button
              key={idx}
              type="button"
              disabled={item.disabled}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className={
                `w-full text-left px-4 py-2 ` +
                `${
                  item.disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-100"
                } ` +
                `${item.active ? "font-semibold" : ""}`
              }
            >
              {item.label}
              {item.helperText && (
                <div className="text-xs text-gray-500 mt-1">
                  {item.helperText}
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
