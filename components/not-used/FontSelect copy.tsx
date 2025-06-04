import React, { useState, useRef, useEffect } from "react";

export interface FontSelectProps {
  /** initial full font name */
  value?: string;
  /** called with the full font name when user selects one */
  onChange?: (fontFullName: string) => void;
  /** called with the numeric weight when weight changes */
  onWeightChange?: (weight: number) => void;
  /** disable the control */
  disabled?: boolean;
  /** autofocus the text input on mount */
  autoFocus?: boolean;
  /** additional wrapper classes */
  className?: string;
}

interface FontMeta {
  family: string;
  fullName: string;
  postscriptName: string;
  weight?: number;
  style?: string;
}

const LocalFontSelect: React.FC<FontSelectProps> = ({
  value = "",
  onChange,
  onWeightChange,
  disabled = false,
  autoFocus = false,
  className = "",
}) => {
  const [fonts, setFonts] = useState<FontMeta[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState(value);

  // selection state
  const [selectedFamily, setSelectedFamily] = useState("");
  const [selectedFullName, setSelectedFullName] = useState("");
  const [selectedWeight, setSelectedWeight] = useState<number | null>(null);

  // remote font loader inputs
  const [remoteFamily, setRemoteFamily] = useState("");
  const [remoteUrl, setRemoteUrl] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loadFontsOnce = useRef<Promise<void> | null>(null);
  const sheetRef = useRef<CSSStyleSheet | null>(null);

  // autofocus
  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  // close on outside click
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  // load local fonts via Font Access API (on first gesture)
  const loadFonts = () => {
    if (loaded) return Promise.resolve();
    if (!loadFontsOnce.current) {
      loadFontsOnce.current = (async () => {
        try {
          const metadata: any[] = await (window as any).queryLocalFonts();
          const seen = new Map<string, FontMeta>();
          metadata.forEach((m) => {
            const { family, fullName, postscriptName, weight, style } = m;
            if (!seen.has(fullName)) {
              seen.set(fullName, {
                family,
                fullName,
                postscriptName,
                weight,
                style,
              });
            }
          });
          const list = Array.from(seen.values()).sort((a, b) =>
            a.family.localeCompare(b.family)
          );
          setFonts(list);

          const sheet = new CSSStyleSheet();
          list.forEach((f) => {
            sheet.insertRule(`
              @font-face {
                font-family: '${f.fullName}';
                src: local('${f.fullName}'), local('${f.postscriptName}');
                font-weight: ${f.weight || 400};
                font-style: ${f.style || "normal"};
              }
            `);
          });
          document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
          sheetRef.current = sheet;
        } catch (e) {
          console.error("Could not query local fonts:", e);
        } finally {
          setLoaded(true);
        }
      })();
    }
    return loadFontsOnce.current;
  };

  const openList = async () => {
    if (disabled) return;
    await loadFonts();
    setOpen(true);
  };

  const toggleList = async () => {
    if (open) setOpen(false);
    else await openList();
  };

  const loadRemoteFont = async () => {
    if (!remoteFamily.trim() || !remoteUrl.trim()) return;
    await loadFonts();
    let sheet = sheetRef.current;
    if (!sheet) {
      sheet = new CSSStyleSheet();
      sheetRef.current = sheet;
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    }
    try {
      sheet.insertRule(`
        @font-face {
          font-family: '${remoteFamily}';
          src: url('${remoteUrl}');
          font-weight: 400;
          font-style: normal;
        }
      `);
      const newFont: FontMeta = {
        family: remoteFamily,
        fullName: remoteFamily,
        postscriptName: remoteFamily,
        weight: 400,
        style: "normal",
      };
      setFonts((f) => [...f, newFont]);
      // auto-select
      setSelectedFamily(remoteFamily);
      setSelectedFullName(remoteFamily);
      setSelectedWeight(400);
      onChange?.(remoteFamily);
      onWeightChange?.(400);
      setFilter(remoteFamily);
      setRemoteFamily("");
      setRemoteUrl("");
    } catch (err) {
      console.error("Failed to load remote font:", err);
    }
  };

  const getAvailableWeights = (family: string): number[] => {
    const weights = Array.from(
      new Set(
        fonts.filter((f) => f.family === family).map((f) => f.weight || 400)
      )
    );
    return weights.sort((a, b) => a - b);
  };

  const filteredFamilies = Array.from(
    new Set(fonts.map((f) => f.family))
  ).filter((fam) => fam.toLowerCase().includes(filter.toLowerCase()));

  const handleSelectFamily = (fam: string) => {
    setSelectedFamily(fam);
    setFilter(fam);
    const weights = getAvailableWeights(fam);
    const defaultW = weights.includes(400) ? 400 : weights[0];
    setSelectedWeight(defaultW);
    // find a fullName matching fam and defaultW
    const matching = fonts.find(
      (f) => f.family === fam && (f.weight || 400) === defaultW
    );
    const full = matching ? matching.fullName : fam;
    setSelectedFullName(full);
    onChange?.(full);
    onWeightChange?.(defaultW);
    setOpen(false);
  };

  // filtered list shows families
  const displayList = open ? filteredFamilies : [];

  return (
    <div
      ref={containerRef}
      className={`relative inline-block text-sm ${className}`}
    >
      <div className="flex">
        <input
          ref={inputRef}
          type="search"
          className="border border-r-0 px-3 py-2 rounded-l focus:outline-hidden grow"
          placeholder="Select font…"
          value={filter}
          disabled={disabled}
          onChange={(e) => setFilter(e.target.value)}
          onClick={openList}
          onFocus={openList}
          aria-autocomplete="list"
          aria-expanded={open}
        />
        <button
          type="button"
          disabled={disabled}
          aria-label="Toggle font list"
          aria-expanded={open}
          className="border border-l-0 px-3 py-2 rounded-r hover:bg-gray-100 disabled:opacity-50"
          onClick={toggleList}
        >
          ▾
        </button>
      </div>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border rounded-sm shadow-lg">
          {/* Remote font loader */}
          <div className="p-2 border-b space-y-2">
            <input
              type="text"
              className="w-full border px-2 py-1 rounded-sm focus:outline-hidden"
              placeholder="Remote font family name"
              value={remoteFamily}
              onChange={(e) => setRemoteFamily(e.target.value)}
            />
            <input
              type="url"
              className="w-full border px-2 py-1 rounded-sm focus:outline-hidden"
              placeholder="Remote font URL (https://...)"
              value={remoteUrl}
              onChange={(e) => setRemoteUrl(e.target.value)}
            />
            <button
              type="button"
              className="w-full bg-blue-500 text-white py-1 rounded-sm hover:bg-blue-600 disabled:opacity-50"
              onClick={loadRemoteFont}
              disabled={!remoteFamily.trim() || !remoteUrl.trim()}
            >
              Load Remote Font
            </button>
          </div>

          {/* Font family list */}
          <ul
            className="max-h-60 overflow-auto"
            role="listbox"
            aria-label="Font families"
          >
            {displayList.length > 0 ? (
              displayList.map((fam) => (
                <li
                  key={fam}
                  role="option"
                  aria-selected={selectedFamily === fam}
                  className={`cursor-pointer px-3 py-2 hover:bg-blue-50 ${
                    selectedFamily === fam ? "bg-blue-100" : ""
                  }`}
                  onClick={() => handleSelectFamily(fam)}
                >
                  {fam}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-gray-500">No fonts found</li>
            )}
          </ul>

          {/* Weight selector */}
          {selectedFamily && (
            <div className="p-2 border-t space-y-2">
              <label className="block text-sm">Weight:</label>
              <select
                className="w-full border px-2 py-1 rounded-sm focus:outline-hidden"
                value={selectedWeight ?? ""}
                onChange={(e) => {
                  const w = Number(e.target.value);
                  setSelectedWeight(w);
                  onWeightChange?.(w);
                  // update fullName selection too
                  const match = fonts.find(
                    (f) =>
                      f.family === selectedFamily && (f.weight || 400) === w
                  );
                  if (match) {
                    setSelectedFullName(match.fullName);
                    onChange?.(match.fullName);
                    setFilter(match.fullName);
                  }
                }}
              >
                {getAvailableWeights(selectedFamily).map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
      {getAvailableWeights(selectedFamily).map((w) => (
        <p className="mt-4 text-lg border p-4 rounded-sm">{w}</p>
      ))}
    </div>
  );
};

export default LocalFontSelect;
