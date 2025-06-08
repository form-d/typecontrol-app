import React, { useEffect, useRef, useState } from "react";
import { useGlobalState } from "../../context/GlobalStateContext";

interface GraphCanvasProps {
  sizes: number[];
  selectedSize: number;
  bezier: (diff: number) => number;
}

const HEIGHT = 200; // Fixed SVG height
const MIN_LABEL_GAP = 50; // Minimum gap between labels in px
const MAX_STEPS = 20;
const MIN_STEPS = 2;

const GraphCanvas = ({ sizes, selectedSize, bezier }: GraphCanvasProps) => {
  const { t, settings } = useGlobalState();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  // Responsive: Observe container width with ResizeObserver
  useEffect(() => {
    const elem = containerRef.current;
    if (!elem) return;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (let entry of entries) {
        setWidth(entry.contentRect.width);
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(elem);

    // Set initial width
    setWidth(elem.offsetWidth);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Fallback for SSR or very fast initial render
  const effectiveWidth = width > 0 ? width : 400;

  // Dynamic steps calculation
  const autoSteps = Math.max(
    MIN_STEPS,
    Math.min(MAX_STEPS, Math.floor(effectiveWidth / MIN_LABEL_GAP))
  );

  // Calculation logic
  const minSize = Math.min(...sizes);
  const maxSize = Math.max(...sizes);
  const sizeToX = (size: number) =>
    ((size - minSize) / (maxSize - minSize)) * effectiveWidth;

  const diffHigh = maxSize - selectedSize;
  const diffLow = minSize - selectedSize;
  const spacingHigh = Math.abs(bezier(diffHigh));
  const spacingLow = Math.abs(bezier(diffLow));
  const rawPeak = Math.max(spacingHigh, spacingLow);
  const maxAllowed = HEIGHT / 2;
  const scale = rawPeak > 0 ? maxAllowed / rawPeak : 1;

  // Bezier path
  const step = 1;
  let pathD = `M 0 ${HEIGHT / 2}`;
  for (let px = 0; px <= effectiveWidth; px += step) {
    const size = minSize + ((maxSize - minSize) * px) / effectiveWidth;
    const diff = size - selectedSize;
    const spacing = bezier(diff) * scale;
    const y = HEIGHT / 2 - (spacing * settings.bezierStrength) / 100;
    pathD += ` L ${px} ${y}`;
  }

  const labelStep = (maxSize - minSize) / autoSteps;
  const pixelStep = effectiveWidth / autoSteps;

  return (
    <div ref={containerRef} id="svgcanvas" className="w-full">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height={HEIGHT}
        viewBox={`0 0 ${effectiveWidth} ${HEIGHT}`}
        className="w-full max-w-full border rounded-lg border-gray-200"
        style={{ display: "block" }}
      >
        {/* Horizontal mid-line */}
        <line
          x1={0}
          y1={HEIGHT / 2}
          x2={effectiveWidth}
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

        {/* X axis tick labels (dynamic steps) */}
        {[...Array(autoSteps + 1)].map((_, i) => {
          const size = Math.round(minSize + labelStep * i);
          let x = i * pixelStep + 5;
          if (i === autoSteps) x -= 40;
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
        <text x={effectiveWidth - 80} y={24} fontSize={12} fill="#333">
          {t("fontSizeLabel")}
        </text>

        {/* The Bezier curve */}
        <path d={pathD} stroke="#9333ea" strokeWidth={2} fill="none" />
      </svg>
    </div>
  );
};

export default GraphCanvas;
