import React, { useEffect } from "react";
import { useGlobalState } from "../../context/GlobalStateContext";
import Divider from "../elements/Divider";
import { useSettingUpdater } from "../../hooks/useSettingUpdater";

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
  const updateSetting = useSettingUpdater(); // one call for _all_ keys

  useEffect(() => {
    if (!sizes.includes(selectedSize)) {
      updateSetting("selectedSize")(sizes[0]);
    }
  }, [sizes, selectedSize, updateSetting]);

  return (
    <div className="px-1 md:px-10 overflow-x-scroll">
      <div className="inline-flex flex-col justify-stretch">
        {sizes.map((size, i) => {
          const diff = size - selectedSize;
          const spacing =
            (letterSpacingPercent
              ? (letterSpacing / 100) * size
              : letterSpacing) + bezier(diff);
          return (
            <div key={i} className="w-full pt-4 md:pt-0">
              <div className="flex flex-col md:flex-row gap-2 justify-start">
                <span className="w-full sm:w-20 self-center font-medium text-sm shrink-0 px-3">
                  {size}px
                </span>
                <span
                  className="text-nowrap rounded-lg py-2 px-3"
                  style={{
                    fontSize: `${size}px`,
                    fontFamily: `'${settings.selectedFont}', sans-serif`,
                    letterSpacing: `${spacing.toFixed(2)}px`,
                    fontWeight: settings.weight,
                    backgroundColor:
                      size === selectedSize
                        ? "color-mix(in oklab, var(--color-primary) 15%, transparent)"
                        : // ? "--alpha(var(--color-primary) / 50%)"
                          "transparent",
                  }}
                >
                  {settings.sampleText}{" "}
                  <span className="text-black/15">{i + 1}</span>
                </span>
              </div>
              <Divider spacing="dense" className="w-full" />
            </div>
          );
        })}
      </div>
      {settings.isFilterActive && (
        <div className="pb-5">
          <div className="inline-flex rounded-full bg-neutral-200 py-0 px-2 border border-transparent text-xs font-bold text-white">
            Some sizes got clipped due to max size
          </div>
        </div>
      )}
    </div>
  );
};

export default FontPreviewList;
