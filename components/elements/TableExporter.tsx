import React, { ReactNode, useRef } from "react";
import { useGlobalState } from "../../context/GlobalStateContext";
import DropdownMenu, { MenuItem } from "../overlay/DropdownMenu";
import IconOnlyButton from "./IconOnlyButton";
import Icon from "./Icon";

interface TableExporterProps {
  /**
   * Wrap any container that includes a <table> somewhere inside
   */
  children: ReactNode;
}

const TableExporter: React.FC<TableExporterProps> = ({ children }) => {
  const { showSnackbar } = useGlobalState();
  const containerRef = useRef<HTMLDivElement>(null);

  const findTable = (): HTMLTableElement | null => {
    // locate the first <table> within the container
    return containerRef.current?.querySelector("table") || null;
  };

  const copyAsHTML = async () => {
    const table = findTable();
    if (!table) {
      showSnackbar({ message: "No table found to copy.", variant: "error" });
      return;
    }
    const html = table.outerHTML;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([table.innerText], { type: "text/plain" }),
        }),
      ]);
      showSnackbar({ message: "Table HTML copied!", variant: "success" });
    } catch {
      try {
        await navigator.clipboard.writeText(html);
        showSnackbar({
          message: "Table HTML copied (text-only)!",
          variant: "success",
        });
      } catch {
        showSnackbar({
          message: "Failed to copy table HTML.",
          variant: "error",
        });
      }
    }
  };

  const exportAsCSV = () => {
    const table = findTable();
    if (!table) {
      showSnackbar({ message: "No table found to export.", variant: "error" });
      return;
    }
    const rows = Array.from(table.rows);
    const csv = rows
      .map((row) =>
        Array.from(row.cells)
          .map((cell) => `"${String(cell.textContent)?.replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "table-export.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    showSnackbar({ message: "Table exported as CSV!", variant: "success" });
  };

  const items: MenuItem[] = [
    {
      label: "Copy HTML",
      onClick: () => {
        copyAsHTML();
      },
    },
    {
      label: "Export CSV",
      onClick: () => {
        exportAsCSV();
      },
    },
  ];

  return (
    <div>
      <div className="w-full flex justify-end gap-2 mb-4">
        <DropdownMenu
          tooltip="Table Options"
          placement="top"
          enabled={true}
          trigger={
            <IconOnlyButton
              id="fontMode-btn"
              ariaLabel="Settings"
              variant="tertiary"
              icon={<Icon size="md" iconClass="ti ti-dots" />}
            />
          }
          items={items}
        />
      </div>
      <div ref={containerRef}>{children}</div>
    </div>
  );
};

export default TableExporter;
