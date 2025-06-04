import React from "react";
import Tooltip from "../elements/Tooltip";
import CopyToClipboard from "../elements/CopyToClipboard";
import TableExporter from "../elements/TableExporter";

type Props = {
  sizes: number[];
  selectedSize: number;
  bezier: (diff: number) => number;
  letterSpacing: number;
  letterSpacingPercent: boolean;
};

const FontSizeTable: React.FC<Props> = ({
  sizes,
  selectedSize,
  bezier,
  letterSpacing,
  letterSpacingPercent,
}) => {
  return (
    <TableExporter>
      <div className="border rounded-lg border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                Index
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                Font Size (px)
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                Letter Spacing (px)
              </th>
              <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">
                Letter Spacing (%)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sizes.map((size, i) => {
              const diff = size - selectedSize;
              const spacing =
                (letterSpacingPercent
                  ? (letterSpacing / 100) * size
                  : letterSpacing) + bezier(diff);
              const spacingPercent = ((spacing / size) * 100).toFixed(2);
              return (
                <tr
                  key={i}
                  className={
                    size === selectedSize
                      ? "after:bg-purple-500 -z-1 relative after:opacity-7 after:rounded-lg after:absolute after:bottom-2 after:right-2 after:top-2 after:left-2"
                      : ""
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {i + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    {size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    <CopyToClipboard
                      text={spacing.toFixed(2)}
                      tooltip="Copy to clipboard"
                    >
                      <span className="inline-block">{spacing.toFixed(2)}</span>
                    </CopyToClipboard>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                    <CopyToClipboard
                      text={`${spacingPercent}%`}
                      tooltip="Copy to clipboard"
                    >
                      <span className="inline-block">{spacingPercent}%</span>
                    </CopyToClipboard>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </TableExporter>
  );
};

export default FontSizeTable;
