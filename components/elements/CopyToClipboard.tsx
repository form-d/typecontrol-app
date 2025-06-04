import React, { ReactNode } from "react";
import Tooltip from "./Tooltip";
import { useGlobalState } from "../../context/GlobalStateContext";

interface CopyToClipboardProps {
  /** The text value to copy to clipboard */
  text: string;
  /** Optional tooltip message */
  tooltip?: string;
  /** Children render inside the clickable area */
  children: ReactNode;
}

const CopyToClipboard: React.FC<CopyToClipboardProps> = ({
  text,
  tooltip = "Copy to clipboard",
  children,
}) => {
  const { showSnackbar } = useGlobalState();

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(text);
      showSnackbar({ message: `Copied ${text} to clipboard!` });
    } catch (err) {
      showSnackbar({ message: "Failed to copy.", variant: "error" });
    }
  };

  return (
    <Tooltip content={tooltip} placement="top">
      <button
        onClick={handleClick}
        className="hover:bg-black/6 px-2 py-2 rounded-lg cursor-pointer focus:outline-none -ml-2"
        aria-label={tooltip}
      >
        {children}
      </button>
    </Tooltip>
  );
};

export default CopyToClipboard;
