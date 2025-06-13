import React from "react";
import { useGlobalState } from "../../context/GlobalStateContext";

export const Snackbar: React.FC = () => {
  const { isSnackbarVisible, snackbarConfig } = useGlobalState();
  if (!isSnackbarVisible || !snackbarConfig) return null;

  const { message, variant = "success" } = snackbarConfig;
  console.log(
    "%ccomponents/Snackbar.tsx:9 snackbarConfig",
    "color: #007acc;",
    snackbarConfig
  );
  const baseClasses =
    "fixed z-15 bottom-4 max-w-sm w-[calc(100%-theme(space.7))] left-1/2 transform -translate-x-1/2 px-6 py-3 text-sm md:text-base rounded-lg shadow-lg";
  const colorClasses =
    variant === "error" ? "bg-red-600 text-white" : "bg-gray-800 text-white";

  return (
    <div
      className={`${baseClasses} ${colorClasses}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
};
