import React, { useState, useRef } from "react";
import TextInputWithLabel from "../form/TextInputWithLabel";
import { useSettingUpdater } from "../../hooks/useSettingUpdater";
import { useGlobalState } from "../../context/GlobalStateContext";
import Button from "../elements/Button";

export interface RemoteFontLoaderProps {
  /** callback with the loaded font family name */
  onLoad?: (fontFamily: string) => void;
  disabled?: boolean;
}

const RemoteFontLoader: React.FC<RemoteFontLoaderProps> = ({
  onLoad,
  disabled = false,
}) => {
  // const [family, setFamily] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const sheetRef = useRef<CSSStyleSheet | null>(null);
  const { t, settings, showSnackbar } = useGlobalState();

  // const loadRemote = () => {
  //   if (!url.trim()) return;
  //   setIsLoading(true);
  //   // if (!family.trim() || !url.trim()) return;
  //   updateSetting("selectedFont")("RemoteFont");
  //   let sheet = sheetRef.current;
  //   if (!sheet) {
  //     sheet = new CSSStyleSheet();
  //     document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  //     sheetRef.current = sheet;
  //   }
  //   try {
  //     sheet.insertRule(
  //       `@font-face {
  //         font-family: '${settings.selectedFont}';
  //         src: url('${url}');
  //       }`
  //     );
  //     onLoad?.(settings.selectedFont);
  //     // setFamily("");
  //     // setUrl("");
  //     setTimeout(() => {
  //       setIsLoading(false);
  //     }, 1000);
  //   } catch (e) {
  //     console.error("Failed to load remote font:", e);
  //     alert(e);
  //     showSnackbar({
  //       message: `Failed to load remote font:'${e}'`,
  //     });
  //     setTimeout(() => {
  //       setIsLoading(false);
  //     }, 1000);
  //   }
  // };

  const loadRemote = async () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;

    setIsLoading(true);
    updateSetting("selectedFont")("RemoteFont");

    const remoteFontFamily = "RemoteFont";

    // Sanitize URL: encode spaces and unsafe characters
    const cleanedUrl = encodeURI(trimmedUrl);

    // Determine format from file extension
    const ext = cleanedUrl.split(".").pop()?.split("?")[0].toLowerCase();
    let format: string | undefined;
    switch (ext) {
      case "woff2":
        format = "woff2";
        break;
      case "woff":
        format = "woff";
        break;
      case "ttf":
        format = "truetype";
        break;
      case "otf":
        format = "opentype";
        break;
    }

    const srcDescriptor = format
      ? `url("${cleanedUrl}") format("${format}")`
      : `url("${cleanedUrl}")`;

    try {
      // Use modern FontFace API if available
      if ("FontFace" in window && document.fonts) {
        const fontFace = new FontFace(remoteFontFamily, srcDescriptor);
        await fontFace.load();
        document.fonts.add(fontFace);
      } else {
        // Fallback to CSSStyleSheet insertRule
        let sheet = sheetRef.current;
        if (!sheet) {
          sheet = new CSSStyleSheet();
          document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
          sheetRef.current = sheet;
        }
        sheet.insertRule(`
          @font-face {
            font-family: '${remoteFontFamily}';
            src: ${srcDescriptor};
          }
        `);
      }

      onLoad?.(remoteFontFamily);
      setUrl("");
    } catch (e: unknown) {
      const err = e instanceof Error ? e : new Error(String(e));
      console.error("Failed to load remote font:", err);
      showSnackbar({ message: `Failed to load remote font: ${err.message}` });
    } finally {
      setTimeout(() => setIsLoading(false), 100);
    }
  };

  const updateSetting = useSettingUpdater(); // one call for _all_ keys

  return (
    <div className="">
      <TextInputWithLabel
        label="Remote Font"
        // label="Load font from remote server"
        placeholder="Remote font URL"
        onChange={(v) => setUrl(v)}
        value={url}
        selectOnFocus
        block
        layout="left"
      />
      <div className="flex justify-end">
        <Button
          onClick={loadRemote}
          disabled={disabled || !url.trim()}
          // disabled={disabled || !family.trim() || !url.trim()}
          size="small"
          className="mb-2 align-end"
          isLoading={isLoading}
        >
          Load Remote Font
        </Button>
      </div>
    </div>
  );
};

export default RemoteFontLoader;
