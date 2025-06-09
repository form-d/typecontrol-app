import React, { useState, useEffect } from "react";
import GoogleFontSelect from "./GoogleFontSelect";
import LocalFontSelect from "./LocalFontSelect";
import RemoteFontLoader from "./RemoteFontLoader";
import IconOnlyButton from "../elements/IconOnlyButton";
import Icon from "../elements/Icon";
import DropdownMenu, { MenuItem } from "../overlay/DropdownMenu";
import { useSettingUpdater } from "../../hooks/useSettingUpdater";

export type ViewMode = "google" | "local" | "remote";

const FontManager: React.FC = () => {
  const [view, setView] = useState<ViewMode>("google");
  const [localAvailable, setLocalAvailable] = useState(false);
  const updateSetting = useSettingUpdater();

  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).queryLocalFonts) {
      setLocalAvailable(true);
    }
  }, []);

  const items: MenuItem[] = [
    {
      label: "Google Fonts",
      onClick: () => {
        setView("google");
        updateSetting("currentViewMode")("google");
        updateSetting("selectedFont")("Roboto");
      },
      active: view === "google",
    },
    {
      label: "Local Fonts",
      onClick: () => {
        setView("local");
        updateSetting("currentViewMode")("local");
      },
      active: view === "local",
      disabled: !localAvailable,
      helperText: !localAvailable
        ? "Not available in this browser. Use latest Chrome, Edge or Opera."
        : undefined,
    },
    {
      label: "Remote Loader",
      onClick: () => {
        setView("remote");
        updateSetting("currentViewMode")("remote");
      },
      active: view === "remote",
    },
  ];

  const renderView = () => {
    switch (view) {
      case "google":
        return <GoogleFontSelect />;
      case "local":
        return <LocalFontSelect />;
      case "remote":
        return <RemoteFontLoader />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-start space-x-2">
      <div className="grow">{renderView()}</div>
      <DropdownMenu
        tooltip="Select font mode"
        placement="bottom-end"
        enabled={true}
        trigger={
          <IconOnlyButton
            id="fontMode-btn"
            ariaLabel="Settings"
            variant="tertiary"
            icon={<Icon size="md" iconClass="ti ti-dots" />}
          />
        }
        items={items}
      />
    </div>
  );
};

export default FontManager;
