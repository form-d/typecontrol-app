import React, { useEffect, useState } from "react";
import { useGlobalState } from "../../context/GlobalStateContext";
import Divider from "../elements/Divider";
import ControlBlock from "../layout/ControlBlock";
import SelectWithLabel from "../form/SelectWithLabel";
import TextInputWithLabel from "../form/TextInputWithLabel";
import Switch from "../form/Switch";
import { getDefaultTourSteps } from "../../context/tourSteps";
import Button from "../elements/Button";
import { useSettingUpdater } from "../../hooks/useSettingUpdater";

export const EditSettingsForm: React.FC = () => {
  // const { user, draftUser, setDraftUser } = useGlobalState();
  // useEffect(() => {
  //   setDraftUser(user);
  // }, [user, setDraftUser]);
  const [customSizes, setCustomSizes] = useState(
    "12,14,16,18,21,24,30,36,48,60,72,128"
  );
  const [enabled, setEnabled] = useState<boolean>(false);
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
  } = useGlobalState();
  const steps = getDefaultTourSteps(t);

  const handleTourRestart = () => {
    closeModal();
    setTimeout(() => {
      resetTour(); // clear the flag
      openTour(steps); // reopen the tour
    }, 400);
  };

  const updateSetting = useSettingUpdater(); // one call for _all_ keys

  return (
    <>
      <p className="text-xs text-gray-700">
        Hier kannst du beliebige Einstellungen oder Inhalte einfügen.
      </p>
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
        description="This is the maximal size of a letter. Larger ratios can produce very lare font sizes eg. 20000px. This value clips the examples to to a max."
        control={
          <TextInputWithLabel
            label=""
            value="300"
            onChange={setCustomSizes}
            selectOnFocus
            size={5}
            className="text-right"
          />
        }
      />
      <Divider />
      <ControlBlock
        title="Layout Orientation"
        description="Switch layout for desktop between panel top or left."
        control={
          <Switch
            checked={settings.layout === "left"}
            onChange={(v) => updateSetting("layout")(v ? "left" : "top")}
          />
        }
      />
      <Divider />
      <Divider />
      <ControlBlock
        title="Line Wrapping"
        description="This limits the examples to one line only. No wrapping."
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
      )}
    </>
  );
};
