import React, { useEffect, useRef, useState } from "react";
import { useGlobalState } from "../../context/GlobalStateContext";
import { useSettingUpdater } from "../../hooks/useSettingUpdater";

import CustomSlider from "../form/CustomSlider";
import TextInputWithLabel from "../form/TextInputWithLabel";
import CheckboxWithLabel from "../form/CheckboxWithLabel";
import SelectWithLabel from "../form/SelectWithLabel";
import NumberInputWithLabel from "../form/NumberInputWithLabel";
import logo from "../assets/typeControl.svg";
import IconOnlyButton from "../elements/IconOnlyButton";
import Icon from "../elements/Icon";
import { EditSettingsForm } from "../content/EditSettingsForm";
import { categorizedFonts } from "../../data/googleFonts";
import TextInputWithDropdown from "../form/TextInputWithDropdown";
import LocalLocalLocalFontSelect from "../font-manager/LocalFontSelect";
import RemoteFontLoader from "../font-manager/RemoteFontLoader";
import FontManager from "../font-manager/FontManager";
import { TourStep } from "../overlay/GuidedTour";
import { getDefaultTourSteps } from "../../context/tourSteps";
import TextInputWithButton from "../form/TextInputWithButton";
import Tooltip from "../elements/Tooltip";
import { ShowInfoLayer } from "../content/ShowInfoLayer";

interface ControlPanelProps {
  sizes: number[];
}

const ControlPanel: React.FC<ControlPanelProps> = ({ sizes }) => {
  const {
    closeModal,
    openModal,
    updateUser,
    showSnackbar,
    t,
    settings,
    setSettings,
    openTour,
  } = useGlobalState();

  const updateSetting = useSettingUpdater(); // one call for _all_ keys

  useEffect(() => {
    const steps = getDefaultTourSteps(t);

    // open the tour when this page mounts
    openTour(steps);
  }, [openTour, t]);

  const editPreferences = () => {
    // setDraftUser(user);
    openModal({
      title: t("editPreferences"),
      content: <EditSettingsForm />,
      suppressCloseButton: true,
      showHeaderCloseButton: true,
      // primaryButton: { label: t("cancel"), action: () => closeModal() },
      // secondaryButton: {
      //   label: t("confirm"),
      //   action: () => {
      //     updateUser();
      //     showSnackbar({
      //       message: `Data updated!`,
      //     });
      //     // closeModal();
      //   },
      // },
    });
  };

  const showInfo = () => {
    // setDraftUser(user);
    openModal({
      title: t("infoTitle"),
      content: <ShowInfoLayer />,
      suppressCloseButton: false,
      showHeaderCloseButton: true,
      // primaryButton: { label: t("cancel"), action: () => closeModal() },
      // secondaryButton: {
      //   label: t("confirm"),
      //   action: () => {
      //     updateUser();
      //     showSnackbar({
      //       message: `Data updated!`,
      //     });
      //     // closeModal();
      //   },
      // },
    });
  };

  const sampleOptions = [
    "The quick brown fox jumps over the lazy dog",
    "Waltz, bad nymph, for quick jigs vex",
    "Sphinx of black quartz, judge my vow",
    "How vexingly quick daft zebras jump!",
    " Mr. Jock, TV quiz PhD, bags few lynx",
    "Two driven jocks help fax my big quiz.",
    "My girl wove six dozen plaid jackets before she quit.",
    "Sixty zippers were quickly picked from the woven jute bag.",
    "A wizard’s job is to vex chumps quickly in fog.",
  ];

  // Handler to copy generated sizes into customSizes setting
  const handleCopySizes = () => {
    const sizesString = sizes.join(",");
    // alert(sizesString);
    // updateSetting("customSizes")("10,15,20,25,30,35,40,45,50");
    updateSetting("customSizes")(sizesString);
    setTimeout(() => {
      updateSetting("useCustom")(true);
      // alert(settings.customSizes);
    }, 5000);
  };

  return (
    <div
      /* 1) Turn this <div> into a query container: */
      className="w-full"
      style={{ containerType: "inline-size" }}
    >
      <div
        className="
      grid
      grid-cols-1            /* default: 1 col */
      gap-12
      justify-items-start
      text-left
      [@container(min-width:768px)]:grid-cols-[minmax(0,150px)_repeat(3,1fr)]
    "
      >
        <div className="w-full">
          <div className="flex flex-row items-center gap-1">
            <svg
              className="text-purple-600"
              width="110"
              height="20"
              viewBox="0 0 110 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M98.053 15.4195C95.093 15.4195 92.853 13.5395 92.853 10.3395V10.0195C92.853 6.81945 95.093 4.93945 98.053 4.93945C101.013 4.93945 103.253 6.81945 103.253 10.0195V10.3395C103.253 13.5395 101.013 15.4195 98.053 15.4195ZM98.053 13.1795C99.593 13.1795 100.733 12.1395 100.733 10.2795V10.0795C100.733 8.21945 99.613 7.17945 98.053 7.17945C96.493 7.17945 95.373 8.21945 95.373 10.0795V10.2795C95.373 12.1395 96.513 13.1795 98.053 13.1795Z"
                fill="currentColor"
              />
              <path
                d="M86.6548 15.1397V5.21969H89.1348V6.33969H89.4948C89.7748 5.53969 90.4948 5.17969 91.4148 5.17969H92.6148V7.41969H91.3748C90.0948 7.41969 89.1748 8.09969 89.1748 9.49969V15.1397H86.6548Z"
                fill="currentColor"
              />
              <path
                d="M82.2337 15.1396C80.9137 15.1396 80.0337 14.2596 80.0337 12.8996V7.29965H77.5537V5.21965H80.0337V2.13965H82.5537V5.21965H85.2737V7.29965H82.5537V12.4596C82.5537 12.8596 82.7537 13.0596 83.1137 13.0596H85.0337V15.1396H82.2337Z"
                fill="currentColor"
              />
              <path
                d="M106.899 15.1396C105.579 15.1396 104.699 14.2596 104.699 12.8996V1.13965H107.219V12.4596C107.219 12.8596 107.419 13.0596 107.779 13.0596H109.699V15.1396H106.899Z"
                fill="currentColor"
              />
              <path
                d="M67.283 15.1396V5.21957H69.763V6.51957H70.123C70.443 5.83957 71.243 5.05957 73.023 5.05957C75.343 5.05957 76.883 6.75957 76.883 9.21957V15.1396H74.363V9.41957C74.363 7.91957 73.603 7.17957 72.243 7.17957C70.703 7.17957 69.803 8.25957 69.803 10.0996V15.1396H67.283Z"
                fill="currentColor"
              />
              <path
                d="M60.6568 15.4195C57.6968 15.4195 55.4568 13.5395 55.4568 10.3395V10.0195C55.4568 6.81945 57.6968 4.93945 60.6568 4.93945C63.6168 4.93945 65.8568 6.81945 65.8568 10.0195V10.3395C65.8568 13.5395 63.6168 15.4195 60.6568 15.4195ZM60.6568 13.1795C62.1968 13.1795 63.3368 12.1395 63.3368 10.2795V10.0795C63.3368 8.21945 62.2168 7.17945 60.6568 7.17945C59.0968 7.17945 57.9768 8.21945 57.9768 10.0795V10.2795C57.9768 12.1395 59.1168 13.1795 60.6568 13.1795Z"
                fill="currentColor"
              />
              <path
                d="M49.2057 15.4199C45.7257 15.4199 43.5657 13.4199 43.5657 9.81986V6.45986C43.5657 2.85986 45.7257 0.859863 49.2057 0.859863C52.6457 0.859863 54.6057 2.85986 54.6057 6.13986V6.25986H52.0057V6.05986C52.0057 4.41986 51.0857 3.21986 49.2057 3.21986C47.3257 3.21986 46.2057 4.45986 46.2057 6.41986V9.85986C46.2057 11.8199 47.3257 13.0599 49.2057 13.0599C51.0857 13.0599 52.0057 11.8599 52.0057 10.2199V9.85986H54.6057V10.1399C54.6057 13.4199 52.6457 15.4199 49.2057 15.4199Z"
                fill="currentColor"
              />
              <path
                d="M37.8428 15.4195C34.8628 15.4195 32.8428 13.4195 32.8428 10.2995V10.0595C32.8428 6.93945 34.8428 4.93945 37.8028 4.93945C40.7228 4.93945 42.6228 7.01945 42.6228 10.0595V10.9195H35.4028C35.4628 12.2795 36.5228 13.2195 37.9228 13.2195C39.3228 13.2195 39.9028 12.4995 40.2428 11.7395L42.3028 12.8195C41.7428 13.8795 40.5628 15.4195 37.8428 15.4195ZM35.4228 9.03945H40.0628C39.9428 7.89945 39.0828 7.13945 37.7828 7.13945C36.4228 7.13945 35.6028 7.89945 35.4228 9.03945Z"
                fill="currentColor"
              />
              <path
                d="M21.469 19.1395V5.21945H23.949V6.41945H24.309C24.769 5.65945 25.629 4.93945 27.429 4.93945C29.809 4.93945 31.909 6.77945 31.909 10.0195V10.3395C31.909 13.5795 29.829 15.4195 27.429 15.4195C25.629 15.4195 24.769 14.6995 24.349 13.9995H23.989V19.1395H21.469ZM26.669 13.2195C28.229 13.2195 29.389 12.1995 29.389 10.2795V10.0795C29.389 8.15945 28.209 7.13945 26.669 7.13945C25.129 7.13945 23.949 8.15945 23.949 10.0795V10.2795C23.949 12.1995 25.109 13.2195 26.669 13.2195Z"
                fill="currentColor"
              />
              <path
                d="M11.1246 19.1397V16.9397H16.5246C16.8846 16.9397 17.0846 16.7397 17.0846 16.3397V13.8397H16.7246C16.4046 14.5197 15.6046 15.2997 13.8246 15.2997C11.5046 15.2997 9.9646 13.5997 9.9646 11.1397V5.21973H12.4846V10.9397C12.4846 12.4397 13.2446 13.1797 14.6046 13.1797C16.1446 13.1797 17.0446 12.0997 17.0446 10.2597V5.21973H19.5646V16.8997C19.5646 18.2597 18.6846 19.1397 17.3646 19.1397H11.1246Z"
                fill="currentColor"
              />
              <path
                d="M5.6236 15.1396C4.3036 15.1396 3.4236 14.2596 3.4236 12.8996V7.29965H0.943604V5.21965H3.4236V2.13965H5.9436V5.21965H8.6636V7.29965H5.9436V12.4596C5.9436 12.8596 6.1436 13.0596 6.5036 13.0596H8.4236V15.1396H5.6236Z"
                fill="currentColor"
              />
            </svg>
            <IconOnlyButton
              id="info-btn"
              ariaLabel="Settings"
              variant="subtle"
              size="small"
              icon={<Icon size="md" iconClass="ti ti-info-circle" />}
              onClick={() => showInfo()}
            />
          </div>
        </div>
        <div className="z- 10 w-full justify-items-start flex flex-col gap-1">
          <NumberInputWithLabel
            label={t("baseSize")}
            value={settings.baseSize}
            onChange={(v) => updateSetting("baseSize")(v)}
            hold
            accelerateHold
            selectOnFocus
            disabled={settings.useCustom}
          />
          <CustomSlider
            label={t("scaleRatio")}
            min={1}
            max={2}
            step={0.01}
            value={settings.ratio}
            onChange={(v) => updateSetting("ratio")(v)}
            precision={3}
            disabled={settings.useCustom}
            onDisabledDoubleClick={() => updateSetting("useCustom")(false)}
          />
          <CustomSlider
            label={t("baseLetterSpacing")}
            min={-5}
            max={5}
            step={0.1}
            value={settings.letterSpacing}
            onChange={(v) => updateSetting("letterSpacing")(v)}
            unit={settings.letterSpacingPercent ? "%" : "px"}
            precision={1}
          />
          <CheckboxWithLabel
            label={t("baseSpacingPercentToggle")}
            checked={settings.letterSpacingPercent}
            onChange={(v) => updateSetting("letterSpacingPercent")(v)}
          />
        </div>
        <div className="w-full flex flex-col gap-1">
          <CustomSlider
            label={t("bezierControl")}
            min={0}
            max={100}
            step={1}
            value={settings.bezierStrength}
            onChange={(v) => updateSetting("bezierStrength")(v)}
            unit="%"
          />

          <CustomSlider
            label={t("bezierPowerControl")}
            min={2}
            max={5}
            step={0.5}
            value={settings.bezierPower}
            onChange={(v) => updateSetting("bezierPower")(v)}
          />

          <SelectWithLabel
            label={t("sizeSelect")}
            value={String(settings.selectedSize)}
            onChange={(v) => updateSetting("selectedSize")(Number(v))}
            options={sizes.map((size) => ({
              label: `${size}px`,
              value: String(size),
            }))}
          />

          <TextInputWithDropdown
            label={t("customSampleText")}
            value={settings.sampleText}
            onChange={(v) => updateSetting("sampleText")(v)}
            placeholder="Type or select a text…"
            options={sampleOptions}
            // optional: custom render each option
            // optionRenderer={(item) => (
            //   <span className="capitalize">{item.toLowerCase()}</span>
            // )}
            block
            tooltipContent="Select from list"
          />
        </div>
        <div className="w-full flex flex-col  gap-1">
          <FontManager />
          <TextInputWithButton
            label={t("customSizes")}
            value={settings.customSizes}
            onChange={(v) => updateSetting("customSizes")(v)}
            onClick={() => {
              // this arrow fn runs with the very latest `sizes`
              const sizesString = sizes.join(",");
              // updateSetting("useCustom")(true);
              // updateSetting("customSizes")(sizesString);
              // ONE call to setSettings, merging both updates
              setSettings({
                ...settings,
                customSizes: sizesString,
                useCustom: true,
              });
              // setSettings((prev) => ({
              //   ...prev,
              //   useCustom: true,
              //   customSizes: sizesString,
              // }));
            }}
            selectOnFocus
            block
            // disabled={!settings.useCustom}
            tooltipContent="Grap computed sizes"
            buttonDisabled={settings.useCustom}
            inputDisabled={!settings.useCustom}
          />
          <CheckboxWithLabel
            label={t("useCustom")}
            checked={settings.useCustom}
            onChange={(v) => updateSetting("useCustom")(v)}
          />
          <div className="w-full h-full flex items-end justify-end">
            <Tooltip content="Customize your preferences" placement="top">
              <IconOnlyButton
                id="profile-btn"
                ariaLabel="Settings"
                variant="text"
                icon={<Icon size="md" iconClass="ti ti-settings" />}
                onClick={() => editPreferences()}
              />
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;
