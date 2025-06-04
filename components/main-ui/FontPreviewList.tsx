import React from "react";
import { useGlobalState } from "../../context/GlobalStateContext";
import Divider from "../elements/Divider";

type Props = {
  sizes: number[];
  selectedSize: number;
  bezier: (diff: number) => number;
  letterSpacing: number;
  letterSpacingPercent: boolean;
};

const FontPreviewList: React.FC<Props> = ({
  sizes,
  selectedSize,
  bezier,
  letterSpacing,
  letterSpacingPercent,
}) => {
  const { settings } = useGlobalState();
  return (
    <div className="space-y-0 md:space-y-2 mt-8 overflow-x-scroll">
      {sizes.map((size, i) => {
        const diff = size - selectedSize;
        const spacing =
          (letterSpacingPercent
            ? (letterSpacing / 100) * size
            : letterSpacing) + bezier(diff);
        return (
          <div key={i}>
            <div className="flex flex-col md:flex-row gap-2 justify-start">
              <span className="w-full sm:w-20 font-medium text-sm shrink-0 px-3">
                {size}px
              </span>
              <span
                className="flex-1 text-nowrap rounded-lg py-2 px-3"
                style={{
                  fontSize: `${size}px`,
                  fontFamily: `'${settings.selectedFont}', sans-serif`,
                  letterSpacing: `${spacing.toFixed(2)}px`,
                  fontWeight: settings.weight,
                  backgroundColor:
                    size === selectedSize ? "#faf5ff" : "transparent",
                }}
              >
                {settings.sampleText}{" "}
                <span className="text-black/15">{i + 1}</span>
              </span>
            </div>
            <Divider spacing="dense" />
          </div>
        );
      })}
    </div>
  );
};

export default FontPreviewList;
