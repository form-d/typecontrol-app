import React, { useEffect, useRef } from "react";
import { useGlobalState } from "../../context/GlobalStateContext";

interface GraphCanvasProps {
  sizes: number[];
  selectedSize: number;
  bezier: (diff: number) => number;
}

const GraphCanvas = ({ sizes, selectedSize, bezier }: GraphCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { t, settings } = useGlobalState();

  useEffect(() => {
    const drawCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const minSize = Math.min(...sizes);
      const maxSize = Math.max(...sizes);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "#ccc";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, canvas.height);
      ctx.stroke();

      // style for your gray lines
      ctx.strokeStyle = "#dddd";
      ctx.lineWidth = 1;

      // for each target size, compute its x position and draw a line
      sizes.forEach((sizeValue) => {
        // map size → px
        const px = ((sizeValue - minSize) / (maxSize - minSize)) * canvas.width;

        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, canvas.height);
        ctx.stroke();
      });

      ctx.fillStyle = "#333";
      ctx.font = "12px sans-serif";
      ctx.fillText("0", 2, canvas.height / 2 - 4);
      ctx.fillText(t("spacingUp"), 10, 20);
      ctx.fillText(t("spacingDown"), 10, canvas.height - 20);
      ctx.fillText(t("fontSizeLabel"), canvas.width - 80, 24);

      const steps = 10;
      const labelStep = (maxSize - minSize) / steps;
      const pixelStep = canvas.width / steps;

      for (let i = 0; i <= steps; i++) {
        const size = Math.round(minSize + labelStep * i);
        let x = i * pixelStep + 5;
        if (i == steps) {
          x = x - 40;
        }
        ctx.fillText(size + "px", x, canvas.height - 5);
      }

      const selectedX =
        ((selectedSize - minSize) / (maxSize - minSize)) * canvas.width;
      ctx.beginPath();
      ctx.moveTo(selectedX, 0);
      ctx.lineTo(selectedX, canvas.height);
      ctx.strokeStyle = "#00dd00";
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);

      // // 1) Compute scale factor from bezier(maxSize):
      // const maxSpacing = bezier(maxSize);
      // const maxAllowed = canvas.height / 2;
      // const scale = maxAllowed / maxSpacing;

      // 1) Figure out which diff gives the largest absolute bezier-value:
      const diffHigh = maxSize - selectedSize;
      const diffLow = minSize - selectedSize;

      const spacingHigh = Math.abs(bezier(diffHigh));
      const spacingLow = Math.abs(bezier(diffLow));

      // pick the bigger one as your “raw” peak
      const rawPeak = Math.max(spacingHigh, spacingLow);

      // avoid division by zero if everything’s flat
      const maxAllowed = canvas.height / 2;
      const scale = rawPeak > 0 ? maxAllowed / rawPeak : 1;

      for (let px = 0; px < canvas.width; px++) {
        const size = minSize + ((maxSize - minSize) * px) / canvas.width;
        const diff = size - selectedSize;
        const spacing = bezier(diff) * scale;
        const y = canvas.height / 2 - (spacing * settings.bezierStrength) / 100;
        // const maxValue = bezier(maxSize);
        // const canvasHeightHalf = canvas.height / 2;
        // let ratio2;
        // if (Math.abs(maxValue) <= canvasHeightHalf) {
        //   ratio2 = canvasHeightHalf / maxValue;
        //   console.log("yes" + maxValue);
        // } else {
        //   console.log("no");
        //   ratio2 = canvasHeightHalf / maxValue;
        // }
        // const ratio = canvasHeightHalf / bezier(diff);
        // // const ratio = canvas.height / 2 / bezier(maxSize);
        // // const ratio = bezier(maxSize) * settings.bezierStrength;
        // // const y =
        // // canvas.height / 2 -
        // // spacing * -ratio * (settings.bezierStrength / 100);
        // const y = canvas.height / 2 - spacing * -ratio2;
        ctx.lineTo(px, y);
      }
      ctx.strokeStyle = "#9333ea";
      ctx.stroke();
    };

    drawCanvas();

    const handleResize = () => drawCanvas();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sizes, selectedSize, bezier]);

  return (
    <canvas
      ref={canvasRef}
      width={1900}
      height={200}
      className="border w-full max-w-full"
    />
  );
};

export default GraphCanvas;
