import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import SelectWithLabel from "../form/SelectWithLabel";
import InputWrapper from "../layout/InputWrapper";
import { useSettingUpdater } from "../../hooks/useSettingUpdater";
import Icon from "../elements/Icon";
import { useFloatingDropdown } from "../../hooks/useFloatingDropdown";
import { createPortal } from "react-dom";

export interface LocalFontSelectProps {
  value?: string;
  onChange?: (fontFullName: string) => void;
  onWeightChange?: (weight: number) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  previewFont?: boolean;
  useRegularPreview?: boolean;
}

interface FontMeta {
  family: string;
  fullName: string;
  postscriptName: string;
  weight: number;
  style: string;
  variationName: string;
}

const weightNameToValue: Record<string, number> = {
  thin: 100,
  extralight: 200,
  ultralight: 200,
  light: 300,
  book: 400,
  regular: 400,
  roman: 400,
  medium: 500,
  semibold: 600,
  demibold: 600,
  bold: 700,
  extrabold: 800,
  ultrabold: 800,
  black: 900,
  heavy: 900,
};

const LocalFontSelect: React.FC<LocalFontSelectProps> = ({
  value = "",
  onChange,
  onWeightChange,
  disabled = false,
  autoFocus = false,
  className = "",
  previewFont = true,
  useRegularPreview = true,
}) => {
  const [fonts, setFonts] = useState<FontMeta[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState("");
  const [searchMode, setSearchMode] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const [selectedFamily, setSelectedFamily] = useState("");
  const [selectedFullName, setSelectedFullName] = useState("");
  const [selectedVariation, setSelectedVariation] = useState("Regular");

  const prevRef = useRef<{
    family: string;
    fullName: string;
    variation: string;
  }>({
    family: selectedFamily,
    fullName: selectedFullName,
    variation: selectedVariation,
  });

  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const loadFontsOnce = useRef<Promise<void> | null>(null);
  const sheetRef = useRef<CSSStyleSheet | null>(null);

  // Floating Dropdown Hook!
  const { open, setOpen, floatingProps, referenceProps, update } =
    useFloatingDropdown({
      offsetPx: 8,
    });

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // Font loading logic
  const loadFonts = () => {
    if (loaded) return Promise.resolve();
    if (!loadFontsOnce.current) {
      loadFontsOnce.current = (async () => {
        try {
          const meta: any[] = await (window as any).queryLocalFonts();
          const map = new Map<string, FontMeta>();
          meta.forEach((m) => {
            const fam = m.family as string;
            const full = m.fullName as string;
            const post = m.postscriptName as string;
            const style = (m.style as string) || "normal";
            const raw = full.replace(fam, "").trim() || "Regular";
            const weight =
              typeof m.weight === "number"
                ? m.weight
                : (() => {
                    const v = raw.toLowerCase();
                    const k = Object.keys(weightNameToValue).find((k) =>
                      v.includes(k)
                    );
                    return k ? weightNameToValue[k] : 400;
                  })();
            if (!map.has(full))
              map.set(full, {
                family: fam,
                fullName: full,
                postscriptName: post,
                weight,
                style,
                variationName: raw,
              });
          });
          const list = Array.from(map.values()).sort(
            (a, b) => a.family.localeCompare(b.family) || a.weight - b.weight
          );
          setFonts(list);
          const sheet = new CSSStyleSheet();
          list.forEach((f) =>
            sheet.insertRule(
              `@font-face { font-family: '${f.fullName}'; src: local('${f.fullName}'), local('${f.postscriptName}'); font-weight: ${f.weight}; font-style: ${f.style}; }`
            )
          );
          document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
          sheetRef.current = sheet;
        } catch {
        } finally {
          setLoaded(true);
        }
      })();
    }
    return loadFontsOnce.current;
  };

  // open/close
  const openDropdown = async () => {
    if (disabled) return;
    await loadFonts();
    prevRef.current = {
      family: selectedFamily,
      fullName: selectedFullName,
      variation: selectedVariation,
    };
    setSearchMode(false);
    setFilter("");
    setOpen(true);
    inputRef.current?.select();
    setTimeout(() => {
      update();
    }, 0);
  };

  const closeDropdown = () => {
    const prev = prevRef.current;
    setSelectedFamily(prev.family);
    setSelectedFullName(prev.fullName);
    setSelectedVariation(prev.variation);
    onChange?.(prev.fullName);
    setOpen(false);
    setSearchMode(false);
    setFilter("");
  };

  // scroll behavior
  useLayoutEffect(() => {
    if (!open || !listRef.current) return;
    if (searchMode) listRef.current.scrollTop = 0;
    else {
      const fam = selectedFamily || "";
      const el = fam
        ? listRef.current.querySelector(`[data-family="${fam}"]`)
        : listRef.current.firstElementChild;
      (el as HTMLElement)?.scrollIntoView({ block: "center" });
    }
  }, [open, searchMode, selectedFamily]);

  // derive lists
  const families = Array.from(new Set(fonts.map((f) => f.family)));
  const displayed = searchMode
    ? families.filter((fam) => fam.toLowerCase().includes(filter.toLowerCase()))
    : families;

  // variations per family
  const getVariations = (fam: string) => {
    const vars = Array.from(
      new Set(fonts.filter((f) => f.family === fam).map((f) => f.variationName))
    );
    if (vars.includes("Regular"))
      return ["Regular", ...vars.filter((v) => v !== "Regular")];
    return vars;
  };

  // Determine which fullName to use for preview: prefer Regular, else next stronger weight, else any
  const getPreviewFullName = (): string | undefined => {
    const fam = selectedFamily;
    if (!previewFont || !fam) return undefined;
    const familyMetas = fonts.filter((f) => f.family === fam);
    if (!familyMetas.length) return undefined;
    const regular = familyMetas.find((f) => f.variationName === "Regular");
    if (regular) return regular.fullName;
    const above400 = familyMetas
      .filter((f) => f.weight >= 400)
      .sort((a, b) => a.weight - b.weight);
    if (above400.length) return above400[0].fullName;
    return familyMetas[0].fullName;
  };

  const handleSelectFamily = (fam: string) => {
    const vars = getVariations(fam);
    const defVar = "Regular";
    const variation = vars.includes(defVar) ? defVar : vars[0];
    const meta = fonts.find(
      (f) => f.family === fam && f.variationName === variation
    )!;
    setSelectedFamily(fam);
    setSelectedVariation(variation);
    setSelectedFullName(meta.fullName);
    onChange?.(meta.fullName);
    setOpen(false);
    setSearchMode(false);
    setFilter("");
    updateSetting("selectedFont")(meta.fullName);
  };

  // select variation outside dropdown
  const handleSelectVariation = (vr: string) => {
    const fam = selectedFamily;
    const meta = fonts.find((f) => f.family === fam && f.variationName === vr)!;
    setSelectedVariation(vr);
    setSelectedFullName(meta.fullName);
    onChange?.(meta.fullName);
    updateSetting("selectedFont")(meta.fullName);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v === "") {
      setSearchMode(false);
      setFilter("");
      setSelectedFamily("");
      setSelectedVariation("Regular");
      setSelectedFullName("");
      onChange?.("");
    } else {
      setSearchMode(true);
      setFilter(v);
    }
  };

  const clearInput = () => {
    setFilter("");
    setSearchMode(false);
    setSelectedFamily("");
    setSelectedFullName("");
    setSelectedVariation("Regular");
    setSelectedFullName("");
    onChange?.("");
    inputRef.current?.focus();
  };

  const showClear =
    isFocused && (searchMode ? filter.length > 0 : selectedFamily.length > 0);

  const isFamilyChosen = selectedFamily != null && selectedFamily !== "";
  const updateSetting = useSettingUpdater();

  return (
    <>
      <InputWrapper label="Locale Font:" layout="left" labelWidthClass="w-1/4">
        <div className={`relative ${className}`}>
          <div className="relative">
            <input
              {...referenceProps}
              ref={(node) => {
                inputRef.current = node;
                referenceProps.ref(node);
              }}
              type="text"
              className="w-full h-8 bg-white border border-gray-300 rounded-lg py-2 px-4 text-gray-900 text-md leading-tight focus:outline-hidden focus:bg-white focus:border-purple-500"
              placeholder="Select font…"
              value={searchMode ? filter : selectedFamily}
              disabled={disabled}
              onFocus={() => {
                setIsFocused(true);
                openDropdown();
              }}
              onBlur={() => setIsFocused(false)}
              onClick={openDropdown}
              onChange={onInputChange}
              style={
                previewFont
                  ? {
                      fontFamily: useRegularPreview
                        ? getPreviewFullName()
                        : selectedFullName,
                    }
                  : undefined
              }
            />

            {showClear && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={clearInput}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label="Clear"
              >
                ×
              </button>
            )}

            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-purple-500">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
          {/* Dropdown rendered via portal and floating-ui */}
          {open &&
            createPortal(
              <ul
                {...floatingProps}
                ref={(node) => {
                  listRef.current = node;
                  floatingProps.ref(node);
                }}
                className="z-20 max-h-60 w-full overflow-auto bg-white border rounded-sm shadow-sm"
                role="listbox"
              >
                {displayed.map((fam) => (
                  <li
                    key={fam}
                    data-family={fam}
                    role="option"
                    onClick={() => handleSelectFamily(fam)}
                    className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    <span>{fam}</span>
                    {selectedFamily === fam && (
                      <Icon size="md" iconClass="ti ti-check" />
                    )}
                  </li>
                ))}
              </ul>,
              document.body
            )}
          {/* variation selector outside dropdown */}
        </div>
      </InputWrapper>
      <div className="mt-2">
        <SelectWithLabel
          label="Style/Variation:"
          disabled={!isFamilyChosen || getVariations(selectedFamily).length < 2}
          value={selectedVariation}
          onChange={(v) => handleSelectVariation(v)}
          options={
            selectedFamily
              ? getVariations(selectedFamily).map((vr) => ({
                  label: vr,
                  value: String(vr),
                }))
              : [
                  {
                    label: "Regular",
                    value: "Regular",
                  },
                ]
          }
        />
      </div>
    </>
  );
};

export default LocalFontSelect;
