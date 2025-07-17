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

// --- Nice ticks helpers ---
function niceNum(value: number, round: boolean): number {
  const exponent = Math.floor(Math.log10(value));
  const fraction = value / Math.pow(10, exponent);
  let niceFraction;
  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }
  return niceFraction * Math.pow(10, exponent);
}

function getNiceTicks(
  min: number,
  max: number,
  maxTicks: number = 10
): number[] {
  const range = niceNum(max - min, false);
  const step = niceNum(range / (maxTicks - 1), true);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks = [];
  for (let v = niceMin; v <= niceMax + 0.5 * step; v += step) {
    ticks.push(Number(v.toFixed(10)));
  }
  return ticks;
}

// --- Component ---
const GraphCanvas = ({ sizes, selectedSize, bezier }: GraphCanvasProps) => {
  const { t, settings } = useGlobalState();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const [shouldRender, setShouldRender] = useState(false);

  // Responsive: Observe container width with ResizeObserver
  useEffect(() => {
    const elem = containerRef.current;
    if (!elem) return;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (let entry of entries) {
        setWidth(entry.contentRect.width);
      }

      if (elem.parentElement) {
        const style = window.getComputedStyle(elem.parentElement);
        if (style.display !== "none") {
          setShouldRender(true);
        } else {
          setShouldRender(false);
        }
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(elem);

    // Set initial width
    setWidth(elem.offsetWidth);

    // Check of element is visible
    if (elem.parentElement) {
      const style = window.getComputedStyle(elem.parentElement);
      if (style.display !== "none") {
        setShouldRender(true);
      }
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  // if (!sizes || !selectedSize) return null;

  // Fallback for SSR or very fast initial render
  const effectiveWidth = width > 0 ? width : 0;

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
  // Calculate the first value for px = 0
  const size0 = minSize; // since px = 0
  const diff0 = size0 - selectedSize;
  const spacing0 = bezier(diff0) * scale;
  const y0 = HEIGHT / 2 - (spacing0 * settings.bezierStrength) / 100;

  // Start the path at the actual first value
  let pathD = `M 0 ${y0}`;
  for (let px = step; px <= effectiveWidth; px += step) {
    // start at step, not 0!
    const size = minSize + ((maxSize - minSize) * px) / effectiveWidth;
    const diff = size - selectedSize;
    const spacing = bezier(diff) * scale;
    const y = HEIGHT / 2 - (spacing * settings.bezierStrength) / 100;
    pathD += ` L ${px} ${y}`;
  }

  // Get nice ticks for the axis labels
  const maxTicks = Math.max(
    MIN_STEPS,
    Math.min(MAX_STEPS, Math.floor(effectiveWidth / MIN_LABEL_GAP))
  );
  const ticks = getNiceTicks(minSize, maxSize, maxTicks);

  return (
    <div
      ref={containerRef}
      id="svgcanvas"
      className="w-full"
      style={{ height: HEIGHT }}
    >
      {shouldRender && sizes.length > 0 && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height={HEIGHT}
          viewBox={`0 0 ${effectiveWidth} ${HEIGHT}`}
          className="w-full max-w-full border rounded-lg border-neutral-200"
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
          {/* <line x1={0} y1={0} x2={0} y2={HEIGHT} stroke="#ccc" strokeWidth={1} /> */}

          {/* Gray lines for each target size */}
          {sizes.map((sizeValue, idx) => {
            if (idx === sizes.length - 1) return null; // Skip last element
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
                strokeDasharray="4 4" // Makes the line dashed
              />
            );
          })}

          {/* Selected X line */}
          <line
            x1={sizeToX(selectedSize)}
            y1={0}
            x2={sizeToX(selectedSize)}
            y2={HEIGHT}
            // stroke="#00dd00"
            stroke="var(--color-neutral-800)"
            strokeWidth={2}
          />

          {/* X axis tick labels (nice numbers) */}
          {ticks.map((tick, i) => {
            const x = sizeToX(tick);
            return (
              <text
                key={i}
                x={x}
                y={HEIGHT - 5}
                fontSize={12}
                fill="#333"
                style={{ pointerEvents: "none", userSelect: "none" }}
                textAnchor={
                  i === 0 ? "start" : i === ticks.length - 1 ? "end" : "middle"
                }
              >
                {tick}
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
          <path
            d={pathD}
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="none"
          />
          {/* <path d={pathD} stroke="#9333ea" strokeWidth={2} fill="none" /> */}
        </svg>
      )}
    </div>
  );
};

export default GraphCanvas;
