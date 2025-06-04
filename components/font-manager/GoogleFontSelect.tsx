import React, { useEffect, useRef, useState } from "react";
import { useGlobalState } from "../../context/GlobalStateContext";
import { useSettingUpdater } from "../../hooks/useSettingUpdater";
import SelectWithLabel from "../form/SelectWithLabel";
import { categorizedFonts } from "../../data/googleFonts";
import CustomSlider from "../form/CustomSlider";

// Load weights for a given font
async function loadAvailableWeights(font: string): Promise<number[]> {
  const fontName = font.replace(/ /g, "+");
  const existing: number[] = [];
  const toLoad: { url: string; weight: number }[] = [];

  for (let w = 100; w <= 900; w += 100) {
    const url = `https://fonts.googleapis.com/css2?family=${fontName}:wght@${w}&display=swap`;
    if (!document.querySelector(`link[href="${url}"]`)) {
      toLoad.push({ url, weight: w });
    } else {
      existing.push(w);
    }
  }

  const loaded = await Promise.all(
    toLoad.map(
      ({ url, weight }) =>
        new Promise<number | null>((resolve) => {
          const link = document.createElement("link");
          link.href = url;
          link.rel = "stylesheet";
          link.onload = () => resolve(weight);
          link.onerror = () => resolve(null);
          document.head.appendChild(link);
        })
    )
  );

  return [...existing, ...loaded.filter((w): w is number => w !== null)];
}

// Apply font + weight
async function applyFontToPage(font: string, weight: number): Promise<void> {
  const fontName = font.replace(/ /g, "+");
  const url = `https://fonts.googleapis.com/css2?family=${fontName}:wght@${weight}&display=swap`;

  const existingLink = document.getElementById("googleFontLink");
  if (existingLink) existingLink.remove();

  const link = document.createElement("link");
  link.id = "googleFontLink";
  link.href = url;
  link.rel = "stylesheet";
  document.head.appendChild(link);

  return new Promise((resolve) => {
    link.onload = () => resolve();
    link.onerror = () => resolve();
  });
}

interface GoogleFontSelectProps {
  // sizes: number[];
}

const GoogleFontSelect: React.FC<GoogleFontSelectProps> = ({}) => {
  const { t, settings } = useGlobalState();

  const updateSetting = useSettingUpdater(); // one call for _all_ keys

  const [availableWeights, setAvailableWeights] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const throttleRef = useRef<number | null>(null);

  // Add a safe fallback
  const fontGroups = categorizedFonts ?? {};

  useEffect(() => {
    if (!settings.selectedFont || settings.currentViewMode !== "google") return;
    setIsLoading(true);
    loadAvailableWeights(settings.selectedFont).then((weights) => {
      if (weights.length) {
        setAvailableWeights(weights);
        updateSetting("availableWeights")(weights);
        // if (!weights.includes(settings.weight)) setWeight(weights[0]);
        if (!weights.includes(settings.weight)) {
          updateSetting("weight")(weights[0]);
        }
      } else {
        alert("No weights available or failed to load.");
      }
      applyFontToPage(settings.selectedFont, settings.weight).finally(() =>
        setIsLoading(false)
      );
    });
  }, [settings.selectedFont]);

  useEffect(() => {
    if (!settings.selectedFont) return;
    if (throttleRef.current) clearTimeout(throttleRef.current);
    throttleRef.current = window.setTimeout(() => {
      setIsLoading(true);
      applyFontToPage(settings.selectedFont, settings.weight).finally(() =>
        setIsLoading(false)
      );
    }, 80);
  }, [settings.weight]);

  return (
    <div className="w-full flex flex-col">
      <SelectWithLabel
        label={t("fontSelectLabel")}
        value={String(settings.selectedFont)}
        onChange={(v) => updateSetting("selectedFont")(v)}
        options={Object.entries(fontGroups).map(([category, fonts]) => ({
          label: category,
          options: fonts.map((font) => ({
            label: font,
            value: font,
          })),
        }))}
      />
      <CustomSlider
        label={t("weightSliderLabel")}
        min={Math.min(...settings.availableWeights)}
        max={Math.max(...settings.availableWeights)}
        step={100}
        value={settings.weight}
        onChange={(v) => updateSetting("weight")(v)}
        disabled={settings.availableWeights.length < 2 || isLoading}
      />
    </div>
  );
};

export default GoogleFontSelect;
