import React, { useEffect, useState } from "react";
import { useGlobalState } from "../../context/GlobalStateContext";
import Divider from "../elements/Divider";
import ControlBlock from "../layout/ControlBlock";
import SelectWithLabel from "../form/SelectWithLabel";
import TextInputWithLabel from "../form/TextInputWithLabel";
import Switch from "../form/Switch";
import { getDefaultTourSteps } from "../../context/tourSteps";
import { useSettingUpdater } from "../../hooks/useSettingUpdater";
import Button from "../elements/Button";

export const EditSettingsForm: React.FC = () => {
  const {
    languages,
    language,
    setLanguage,
    hasSeenTour,
    resetTour,
    openTour,
    closeModal,
    t,
    settings,
    setSettings,
    resetSettings,
    showSnackbar,
  } = useGlobalState();
  const steps = getDefaultTourSteps(t);

  const handleTourRestart = () => {
    closeModal();
    setTimeout(() => {
      resetTour(); // clear the flag
      openTour(steps); // reopen the tour
    }, 400);
  };
  const handleReset = () => {
    closeModal();
    resetSettings();
    setTimeout(() => {
      showSnackbar({ message: `App reset to default!` });
    }, 800);
  };

  const updateSetting = useSettingUpdater(); // one call for _all_ keys

  // Local state for the input field
  const [inputValue, setInputValue] = useState(String(settings.maxLetterSize));

  // Sync local inputValue if settings change externally
  useEffect(() => {
    setInputValue(String(settings.maxLetterSize));
  }, [settings.maxLetterSize]);

  return (
    <>
      {/* <p className="text-xs text-gray-700">
        Hier kannst du beliebige Einstellungen oder Inhalte einfügen.
      </p> */}
      <Divider />
      <ControlBlock
        title="Interface Language:"
        control={
          <SelectWithLabel
            label=""
            value={language}
            onChange={(v) => setLanguage(v)}
            // onChange={(v) => setSelectedSize(Number(v))}
            options={languages.map((lng) => ({
              label: lng.toUpperCase(),
              value: String(lng),
            }))}
          />
        }
      />
      <Divider />
      <ControlBlock
        title="Maximal Letter Size:"
        description="This is the maximal size of a letter. Larger ratios can produce very lare font sizes eg. 20000px. This value clips the examples to to a max. Must e < 100"
        control={
          <TextInputWithLabel
            label=""
            value={inputValue}
            // onChange={(v) => updateSetting("maxLetterSize")(Number(v))}
            onChange={(v) => {
              // Always keep the new value in local state
              setInputValue(v);
              // Only write to settings if the value has more than 3 digits
              if (v.replace(/\D/g, "").length > 2) {
                const num = Number(v);
                if (!isNaN(num)) {
                  updateSetting("maxLetterSize")(num);
                }
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const num = Number(inputValue);
                if (num < 100) {
                  setInputValue("100");
                  updateSetting("maxLetterSize")(100);
                } else if (!isNaN(num)) {
                  updateSetting("maxLetterSize")(num);
                }
              }
            }}
            selectOnFocus
            size={5}
            className="text-right"
          />
        }
      />
      <Divider />
      <ControlBlock
        title="Layout Orientation"
        description="Switch layout for desktop (< 1400px) between panel top or left."
        control={
          <Switch
            checked={settings.layout === "left"}
            onChange={(v) => updateSetting("layout")(v ? "left" : "top")}
          />
        }
      />
      <Divider />
      {hasSeenTour && (
        <>
          <ControlBlock
            title="Reset app"
            description="Restore all app settings and values to default"
            control={
              <Button size="small" variant="secondary" onClick={handleReset}>
                Reset
              </Button>
            }
          />
          <Divider />
        </>
      )}
      <p className="text-xs text-gray-300">
        App version: {process.env.NEXT_PUBLIC_APP_VERSION} (Build:{" "}
        {process.env.NEXT_PUBLIC_GIT_COMMIT}
        {" - "}
        {process.env.NEXT_PUBLIC_COMMIT_DATE})
      </p>
      {/* <ControlBlock
        title="Line Wrapping"
        description="This limits the examples to one line only. No wrapping."
        control={
          <Switch
            checked={settings.layout === "left"}
            onChange={(v) => updateSetting("layout")(v ? "left" : "top")}
          />
        }
      />
      <Divider /> */}
      {/* {hasSeenTour && (
        <>
          <ControlBlock
            title="Guide Tour"
            description="Explor typeControl's fetaure and possibilites"
            control={
              <Button
                size="small"
                variant="secondary"
                onClick={handleTourRestart}
              >
                Restart tour
              </Button>
            }
          />
          <Divider />
        </>
      )} */}
    </>
  );
};
