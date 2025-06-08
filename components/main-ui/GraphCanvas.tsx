import React from "react";
import { useGlobalState } from "../../context/GlobalStateContext";

interface GraphCanvasProps {
  sizes: number[];
  selectedSize: number;
  bezier: (diff: number) => number;
}

const WIDTH = 1900;
const HEIGHT = 200;

const GraphCanvas = ({ sizes, selectedSize, bezier }: GraphCanvasProps) => {
  const { t, settings } = useGlobalState();

  // Calculate min, max and scaling factors
  const minSize = Math.min(...sizes);
  const maxSize = Math.max(...sizes);

  // Functions for mapping size to X, and px to size
  const sizeToX = (size: number) =>
    ((size - minSize) / (maxSize - minSize)) * WIDTH;

  // Determine scaling for the bezier curve
  const diffHigh = maxSize - selectedSize;
  const diffLow = minSize - selectedSize;
  const spacingHigh = Math.abs(bezier(diffHigh));
  const spacingLow = Math.abs(bezier(diffLow));
  const rawPeak = Math.max(spacingHigh, spacingLow);
  const maxAllowed = HEIGHT / 2;
  const scale = rawPeak > 0 ? maxAllowed / rawPeak : 1;

  // Generate the path for the bezier graph
  const step = 1;
  let pathD = `M 0 ${HEIGHT / 2}`;
  for (let px = 0; px <= WIDTH; px += step) {
    const size = minSize + ((maxSize - minSize) * px) / WIDTH;
    const diff = size - selectedSize;
    const spacing = bezier(diff) * scale;
    const y = HEIGHT / 2 - (spacing * settings.bezierStrength) / 100;
    pathD += ` L ${px} ${y}`;
  }

  // Tick labels for the X axis
  const steps = 10;
  const labelStep = (maxSize - minSize) / steps;
  const pixelStep = WIDTH / steps;

  return (
    <div id="svgcanvas" className="w-full">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={WIDTH}
        height={HEIGHT}
        className="w-full max-w-full border"
      >
        {/* Horizontal mid-line */}
        <line
          x1={0}
          y1={HEIGHT / 2}
          x2={WIDTH}
          y2={HEIGHT / 2}
          stroke="#ccc"
          strokeWidth={1}
        />
        {/* Left vertical line */}
        <line x1={0} y1={0} x2={0} y2={HEIGHT} stroke="#ccc" strokeWidth={1} />

        {/* Gray lines for each target size */}
        {sizes.map((sizeValue, idx) => {
          const px = sizeToX(sizeValue);
          return (
            <line
              key={idx}
              x1={px}
              y1={0}
              x2={px}
              y2={HEIGHT}
              stroke="#dddd"
              strokeWidth={1}
            />
          );
        })}

        {/* Selected X line */}
        <line
          x1={sizeToX(selectedSize)}
          y1={0}
          x2={sizeToX(selectedSize)}
          y2={HEIGHT}
          stroke="#00dd00"
          strokeWidth={2}
        />

        {/* X axis tick labels */}
        {[...Array(steps + 1)].map((_, i) => {
          const size = Math.round(minSize + labelStep * i);
          let x = i * pixelStep + 5;
          if (i === steps) x -= 40;
          return (
            <text
              key={i}
              x={x}
              y={HEIGHT - 5}
              fontSize={12}
              fill="#333"
              style={{ pointerEvents: "none", userSelect: "none" }}
            >
              {size}px
            </text>
          );
        })}

        {/* Labels */}
        <text x={2} y={HEIGHT / 2 - 4} fontSize={12} fill="#333">
          0
        </text>
        <text x={10} y={20} fontSize={12} fill="#333">
          {t("spacingUp")}
        </text>
        <text x={10} y={HEIGHT - 20} fontSize={12} fill="#333">
          {t("spacingDown")}
        </text>
        <text x={WIDTH - 80} y={24} fontSize={12} fill="#333">
          {t("fontSizeLabel")}
        </text>

        {/* The Bezier curve */}
        <path d={pathD} stroke="#9333ea" strokeWidth={2} fill="none" />
      </svg>
    </div>
  );
};

export default GraphCanvas;
