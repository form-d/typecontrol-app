import React, { useState, useRef, useEffect, useLayoutEffect } from "react";

export interface FontSelectProps {
  value?: string;
  onChange?: (fontFullName: string) => void;
  onWeightChange?: (weight: number) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  /** When true, apply the selected font to the input text */
  previewFont?: boolean;
  /** When true, preview always uses the Regular (or fallback) variation rather than the selected variation */
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

// Map common weight names to numeric values
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

const FontSelect: React.FC<FontSelectProps> = ({
  value = "",
  onChange,
  onWeightChange,
  disabled = false,
  autoFocus = false,
  className = "",
  previewFont = true,
  useRegularPreview = false,
}) => {
  const [fonts, setFonts] = useState<FontMeta[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [searchMode, setSearchMode] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const [selectedFamily, setSelectedFamily] = useState("");
  const [selectedFullName, setSelectedFullName] = useState("");
  const [selectedVariation, setSelectedVariation] = useState("Regular");

  // preserve previous selection for cancel (capture family, fullName, variation)
  const prevRef = useRef<{
    family: string;
    fullName: string;
    variation: string;
  }>({
    family: selectedFamily,
    fullName: selectedFullName,
    variation: selectedVariation,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const loadFontsOnce = useRef<Promise<void> | null>(null);
  const sheetRef = useRef<CSSStyleSheet | null>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      )
        closeDropdown();
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

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

  const openDropdown = async () => {
    if (disabled) return;
    await loadFonts();
    // save previous state
    prevRef.current = {
      family: selectedFamily,
      fullName: selectedFullName,
      variation: selectedVariation,
    };
    setSearchMode(false);
    setFilter("");
    setOpen(true);
    inputRef.current?.select();
  };

  const closeDropdown = () => {
    const prev = prevRef.current;
    // restore prior selection
    setSelectedFamily(prev.family);
    setSelectedFullName(prev.fullName);
    setSelectedVariation(prev.variation);
    onChange?.(prev.fullName);
    setOpen(false);
    setSearchMode(false);
    setFilter("");
  };

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

  const families = Array.from(new Set(fonts.map((f) => f.family)));
  const displayed = searchMode
    ? families.filter((fam) => fam.toLowerCase().includes(filter.toLowerCase()))
    : families;

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
    // look for Regular
    const regular = familyMetas.find((f) => f.variationName === "Regular");
    if (regular) return regular.fullName;
    // fallback to weight >= 400
    const above400 = familyMetas
      .filter((f) => f.weight >= 400)
      .sort((a, b) => a.weight - b.weight);
    if (above400.length) return above400[0].fullName;
    // else return first available
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
  };

  const handleSelectVariation = (vr: string) => {
    const fam = selectedFamily;
    const meta = fonts.find((f) => f.family === fam && f.variationName === vr)!;
    setSelectedVariation(vr);
    setSelectedFullName(meta.fullName);
    onChange?.(meta.fullName);
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
    setSelectedVariation("Regular");
    setSelectedFullName("");
    onChange?.("");
    inputRef.current?.focus();
  };

  const showClear =
    isFocused && (searchMode ? filter.length > 0 : selectedFamily.length > 0);

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="search"
          className="w-full border px-3 py-2 rounded-sm focus:outline-hidden"
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
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label="Clear"
          >
            ×
          </button>
        )}
      </div>
      {open && (
        <ul
          ref={listRef}
          className="absolute z-20 mt-1 max-h-60 w-full overflow-auto bg-white border rounded-sm shadow-sm"
          role="listbox"
        >
          {displayed.map((fam) => (
            <li
              key={fam}
              data-family={fam}
              role="option"
              onClick={() => handleSelectFamily(fam)}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {fam}
            </li>
          ))}
        </ul>
      )}
      {selectedFamily && (
        <div className="mt-2">
          <label className="block text-sm mb-1">Style/Variation:</label>
          <select
            className="w-full border px-2 py-1 rounded-sm"
            value={selectedVariation}
            onChange={(e) => handleSelectVariation(e.target.value)}
          >
            {getVariations(selectedFamily).map((vr) => (
              <option key={vr} value={vr}>
                {vr}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default FontSelect;
