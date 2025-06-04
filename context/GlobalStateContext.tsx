// Indicates this component must be rendered on the client and allows use of hooks like useState and useEffect
"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import { Modal } from "../components/overlay/Modal";
import { Snackbar } from "../components/overlay/Snackbar";
import { usePersistedState } from "../hooks/usePersistedState";
import { translations, defaultLanguage } from "../i18n/translations";
import { GuidedTour, TourStep } from "../components/overlay/GuidedTour";

// ----- Types -----
export type ModalConfig = {
  title?: string;
  content?: ReactNode;
  /** whether clicking the shaded backdrop closes the modal */
  closeOnBackdropClick?: boolean;
  primaryButton?: { label: string; action: () => void };
  secondaryButton?: { label: string; action: () => void };
  suppressCloseButton?: boolean;
  /** Show an 'X' in the header to close */
  showHeaderCloseButton?: boolean;
  disableScroll?: boolean;
};

type SnackbarConfig = {
  /** The message to display */
  message: string;
  /** How long (ms) the snackbar stays visible; defaults to 3000 */
  duration?: number;
  /** Visual style: success (default) or error */
  variant?: "success" | "error";
};

export type User = { id: string; name: string; email: string };

export type UISettings = {
  baseSize: number;
  ratio: number;
  letterSpacing: number;
  letterSpacingPercent: boolean;
  bezierStrength: number;
  bezierPower: number;
  customSizes: string;
  useCustom: boolean;
  selectedSize: number;
  modalOpen: boolean;
  enabled: boolean;
  sampleText: string;
  selectedFont: string;
  availableWeights: number[];
  weight: number;
  currentViewMode: string;
  layout: "top" | "left";
};

export type GlobalState = {
  // modal
  isModalOpen: boolean;
  modalConfig: ModalConfig;
  openModal: (cfg: ModalConfig) => void;
  closeModal: () => void;

  // snackbar
  isSnackbarVisible: boolean;
  snackbarConfig: SnackbarConfig;
  showSnackbar: (cfg: SnackbarConfig) => void;

  // user
  user: User;
  draftUser: User;
  setDraftUser: (u: User) => void;
  updateUser: () => void;

  // i18n
  languages: string[];
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;

  // guided tour
  isTourOpen: boolean;
  tourSteps: TourStep[];
  openTour: (steps: TourStep[]) => void;
  closeTour: () => void;
  /** Indicates if user has already completed or skipped the tour */
  hasSeenTour: boolean;
  /** Resets the "seen" flag so the tour can run again */
  resetTour: () => void;

  // settings
  settings: UISettings;
  // setSettings: (s: UISettings) => void;
  setSettings: (s: UISettings) => void;

  // Main calc functions
  sizes: number[];
  bezier: (diff: number) => number;

  // page-scroll locking
  disablePageScroll: () => void;
  enablePageScroll: () => void;
};

const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

export const GlobalStateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // user persistence
  const defaultUser: User = {
    id: "u123",
    name: "Jane Doe",
    email: "jane.doe@example.com",
  };
  const [user, setUser] = usePersistedState<User>("user", defaultUser);
  const [draftUser, setDraftUser] = useState<User>(user);

  // Keep a ref to the latest draftUser so updateUser never closes over a stale value
  const draftRef = useRef<User>(draftUser);
  useEffect(() => {
    draftRef.current = draftUser;
  }, [draftUser]);

  // Now updateUser can be stable (no deps on draftUser) yet always set the latest draft
  const updateUser = useCallback(() => {
    setUser(draftRef.current);
  }, [setUser]);

  // modal
  const [isModalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({});

  // lock page scroll
  const disablePageScroll = useCallback(() => {
    document.body.classList.add("overflow-hidden");
  }, []);

  // restore page scroll
  const enablePageScroll = useCallback(() => {
    document.body.classList.remove("overflow-hidden");
  }, []);

  const openModal = useCallback((cfg: ModalConfig) => {
    // setModalConfig(cfg);
    // pull disableScroll out of cfg, defaulting to true
    // const { disableScroll = true, ...rest } = cfg;

    // alert(cfg.disableScroll);

    // // save the merged config
    // setModalConfig({ disableScroll, ...rest });

    // if cfg.disableScroll is explicitly false, turn it off;
    // otherwise default to true
    const shouldDisableScroll = cfg.disableScroll !== false;

    // store that back on the config so closeModal can read it
    setModalConfig({ ...cfg, disableScroll: shouldDisableScroll });

    if (shouldDisableScroll) {
      disablePageScroll();
    }

    setModalOpen(true);

    // if (cfg.disableScroll) disablePageScroll();
    // setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    if (modalConfig.disableScroll) enablePageScroll();
    setTimeout(() => {
      setModalConfig({});
    }, 500);
  }, [modalConfig]);

  // snackbar
  const [isSnackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarConfig, setSnackbarConfig] = useState<SnackbarConfig>({
    message: "",
    duration: 3000,
    variant: "success",
  });
  const showSnackbar = useCallback((cfg: SnackbarConfig) => {
    setSnackbarConfig({
      message: cfg.message,
      duration: cfg.duration ?? 3000,
      variant: cfg.variant ?? "success",
    });
    setSnackbarVisible(true);
  }, []);
  useEffect(() => {
    if (!isSnackbarVisible) return;
    const timer = setTimeout(
      () => setSnackbarVisible(false),
      snackbarConfig.duration
    );
    return () => clearTimeout(timer);
  }, [isSnackbarVisible, snackbarConfig.duration]);

  // i18n
  const languages = Object.keys(translations);
  const [language, setLanguage] = usePersistedState<string>(
    "language",
    defaultLanguage
  );
  const t = useCallback(
    (key: string) => translations[language]?.[key] ?? key,
    [language]
  );

  const defaultSettings: UISettings = {
    baseSize: 12,
    ratio: 1.25,
    letterSpacing: 0,
    letterSpacingPercent: false,
    bezierStrength: 15,
    bezierPower: 2,
    customSizes: "12,14,16,18,21,24,30,36,48,60,72,128",
    useCustom: false,
    selectedSize: 12,
    modalOpen: false,
    enabled: false,
    sampleText: "typeControl – letterspacing with ease",
    selectedFont: "Roboto",
    availableWeights: [400],
    weight: 700,
    currentViewMode: "google",
    layout: "top",
  };
  const [settings, setSettings] = usePersistedState<UISettings>(
    "ui-settings",
    defaultSettings
  );

  // 1) Compute sizes once, memoized on exactly the settings that affect them
  const sizes = useMemo<number[]>(() => {
    if (settings.useCustom) {
      return settings.customSizes
        .split(",")
        .map((n) => parseFloat(n.trim()))
        .filter((n) => !isNaN(n));
    }
    return Array.from({ length: 12 }, (_, i) =>
      Math.round(settings.baseSize * Math.pow(settings.ratio, i))
    );
  }, [
    settings.useCustom,
    settings.customSizes,
    settings.baseSize,
    settings.ratio,
  ]);

  // 2) Memoize your bezier so it always sees the latest settings
  const bezier = useMemo(
    () => (diff: number) => {
      const direction = diff >= 0 ? 1 : -1;
      return (
        (direction *
          -settings.bezierStrength *
          0.25 *
          Math.pow(Math.abs(diff), settings.bezierPower)) /
        Math.pow(200, settings.bezierPower)
      );
    },
    [settings.bezierStrength, settings.bezierPower]
  );

  // guided tour
  // --- Guided Tour persistence: remember if user has already seen/skipped it ---
  // const [hasSeenTour, setHasSeenTour] = useState(true);
  const [hasSeenTour, setHasSeenTour] = usePersistedState<boolean>(
    "hasSeenTour",
    true
  );
  const [isTourOpen, setTourOpen] = useState(false);
  const [tourSteps, setTourSteps] = useState<TourStep[]>([]);
  const openTour = useCallback(
    (steps: TourStep[]) => {
      if (hasSeenTour) return; // bail if already seen
      setTourSteps(steps);
      setTourOpen(true);
      disablePageScroll();
    },
    [hasSeenTour]
  );
  const closeTour = useCallback(() => {
    setTourOpen(false);
    setTourSteps([]);
    setHasSeenTour(true); // mark as seen or skipped
    enablePageScroll();
  }, [setHasSeenTour]);

  // helper to let user re-start the tour
  const resetTour = useCallback(() => {
    setHasSeenTour(false);
  }, [setHasSeenTour]);

  return (
    <GlobalStateContext.Provider
      value={{
        // modal
        isModalOpen,
        modalConfig,
        openModal,
        closeModal,
        // snackbar
        isSnackbarVisible,
        snackbarConfig,
        showSnackbar,
        // user
        user,
        draftUser,
        setDraftUser,
        updateUser,
        // i18n
        languages,
        language,
        setLanguage,
        t,
        // guided tour
        isTourOpen,
        tourSteps,
        openTour,
        closeTour,
        hasSeenTour,
        resetTour,
        // Seetings
        settings,
        setSettings,
        // Main Functins depending on settings
        sizes,
        bezier,
        // window scoll
        disablePageScroll,
        enablePageScroll,
      }}
    >
      {children}
      <Modal />
      <Snackbar />
      {isTourOpen && <GuidedTour steps={tourSteps} onClose={closeTour} />}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const ctx = useContext(GlobalStateContext);
  if (!ctx)
    throw new Error("useGlobalState must be used within GlobalStateProvider");
  return ctx;
};
