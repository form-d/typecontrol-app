import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  Fragment,
} from "react";
import SelectWithLabel from "../form/SelectWithLabel";
import InputWrapper from "../layout/InputWrapper";
import { useSettingUpdater } from "../../hooks/useSettingUpdater";
import Icon from "../elements/Icon";
import { useFloatingDropdown } from "../../hooks/useFloatingDropdown";
import { createPortal } from "react-dom";
import { Transition } from "@headlessui/react";
import { tree } from "next/dist/build/templates/app-page";

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
  const [isLoading, setIsLoading] = useState(false);
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
  const { open, setOpen, floatingProps, referenceProps, update, pointerTrap } =
    useFloatingDropdown({
      offsetPx: 8,
      onClickOutside: () => {
        closeDropdown();
      },
    });

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (!isFocused) {
      restorePreviousSelection();
    }
  }, [isFocused]);
  // useEffect(() => {
  //   if (!open) return;
  //   const onClickOutside = (e: MouseEvent) => {
  //     if (
  //       containerRef.current &&
  //       !containerRef.current.contains(e.target as Node)
  //     )
  //       closeDropdown();
  //   };
  //   document.addEventListener("mousedown", onClickOutside);
  //   return () => document.removeEventListener("mousedown", onClickOutside);
  // }, [open]);

  // Font loading logic
  const loadFonts = () => {
    if (loaded) return Promise.resolve();
    setIsLoading(true);
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
    prevRef.current = {
      family: selectedFamily,
      fullName: selectedFullName,
      variation: selectedVariation,
    };
    setSearchMode(false);
    setFilter("");
    if (!fonts.length) {
      await loadFonts();
      setIsLoading(false);
    }
    setTimeout(() => {
      setOpen(true);
      update();
      // select input text
      inputRef.current?.select();
    }, 0);
  };

  const closeDropdown = () => {
    if (!open) return;
    setOpen(false);
    restorePreviousSelection();
    // prevent dropdown from fashing
    setTimeout(() => {
      setSearchMode(false);
      setFilter("");
    }, 200);
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

  const restorePreviousSelection = () => {
    const prev = prevRef.current;
    if (!prev) return;
    setSelectedFamily(prev.family);
    setSelectedFullName(prev.fullName);
    setSelectedVariation(prev.variation);
    onChange?.(prev.fullName);
  };

  const scrollIntoView = () => {
    if (!open || !listRef.current) return;
    const fam = selectedFamily || "";
    const el = fam
      ? listRef.current.querySelector(`[data-family="${fam}"]`)
      : listRef.current.firstElementChild;
    if (el && listRef.current) {
      // Scroll the list container so that the element is in view
      const parent = listRef.current;
      const child = el as HTMLElement;
      parent.scrollTop =
        child.offsetTop - parent.clientHeight - child.clientHeight;
      // child.offsetTop - parent.clientHeight / 2 - child.clientHeight / 2;
    }
  };

  // scroll behavior
  useLayoutEffect(() => {
    if (!open || !listRef.current) return;
    if (searchMode) listRef.current.scrollTop = 0;
    else {
      // const fam = selectedFamily || "";
      // const el = fam
      //   ? listRef.current.querySelector(`[data-family="${fam}"]`)
      //   : listRef.current.firstElementChild;
      // if (el && listRef.current) {
      //   // Scroll the list container so that the element is in view
      //   const parent = listRef.current;
      //   const child = el as HTMLElement;
      //   parent.scrollTop =
      //     child.offsetTop - parent.clientHeight / 2 - child.clientHeight / 2;
      //   console.log(
      //     "scrollTop :>> ",
      //     child.offsetTop -
      //       parent.offsetTop -
      //       parent.clientHeight / 2 +
      //       child.clientHeight / 2
      //   );
      //   console.log("child.offsetTop :>> ", child.offsetTop);
      //   console.log("parent.scrollHeight :>> ", parent.scrollHeight);
      //   console.log(
      //     "child.offsetTop - parent.clientHeight / 2 - child.clientHeight / 2 :>> ",
      //     child.offsetTop - parent.clientHeight / 2 - child.clientHeight / 2
      //   );
      // }
    }
  }, [open, searchMode]);

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
    setOpen(false);
    setSelectedFamily(fam);
    setSelectedVariation(variation);
    setSelectedFullName(meta.fullName);
    onChange?.(meta.fullName);
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

  const showClear =
    isFocused && (searchMode ? filter.length > 0 : selectedFamily.length > 0);

  const isFamilyChosen = selectedFamily != null && selectedFamily !== "";
  const updateSetting = useSettingUpdater();

  const [shouldShow, setShouldShow] = useState(false);

  // open is true
  // useEffect(() => {
  //   if (open) {
  //     requestAnimationFrame(() => setShouldShow(true));
  //   }
  // }, [open]);

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
              className="w-full h-8 bg-white border border-gray-300 rounded-lg py-2 px-4 text-gray-900 text-md leading-tight hover:border-gray-400 focus:outline-hidden focus:bg-white focus:border-purple-500"
              placeholder="Select font…"
              value={searchMode ? filter : selectedFamily}
              disabled={disabled}
              onFocus={() => {
                setIsFocused(true);
                // openDropdown(); // needed ???
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
                className="absolute flex justify-center items-center right-6 top-1/2 transform -translate-y-1/2 text-gray-500 bg-transparent hover:bg-gray-100 transition-colors duration-150 p-0 h-5 w-5 rounded cursor-pointer"
                aria-label="Clear"
              >
                <Icon size="xs" iconClass="ti ti-x" />
              </button>
            )}

            <div className="pointer-events-none absolute inset-y-0 right-0 flex justify-center items-center px-2 text-purple-500">
              {isLoading ? (
                <span className="inline-flex items-center">
                  <svg
                    aria-hidden="true"
                    role="status"
                    className={"w-4 h-4 text-current animate-spin"}
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 
                      50 100.591C22.3858 100.591 0 78.2051 0 
                      50.5908C0 22.9766 22.3858 0.59082 50 
                      0.59082C77.6142 0.59082 100 22.9766 100 
                      50.5908ZM9.08144 50.5908C9.08144 73.1895 
                      27.4013 91.5094 50 91.5094C72.5987 91.5094 
                      90.9186 73.1895 90.9186 50.5908C90.9186 
                      27.9921 72.5987 9.67226 50 9.67226C27.4013 
                      9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 
                      35.9116 97.0079 33.5539C95.2932 28.8227 
                      92.871 24.3692 89.8167 20.348C85.8452 
                      15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 
                      4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 
                      0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 
                      1.69328 37.813 4.19778 38.4501 6.62326C39.0873 
                      9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 
                      9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 
                      10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 
                      17.9648 79.3347 21.5619 82.5849 25.841C84.9175 
                      28.9121 86.7997 32.2913 88.1811 35.8758C89.083 
                      38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="#ffffff"
                    />
                  </svg>
                </span>
              ) : (
                <svg
                  className="fill-current h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              )}
            </div>
          </div>
          {/* Dropdown rendered via portal and floating-ui */}
          {createPortal(
            <Transition
              as={Fragment}
              show={open && displayed.length > 0}
              enter="transition-opacity duration-100"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-250"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              beforeEnter={scrollIntoView}
            >
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
              </ul>
            </Transition>,
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
