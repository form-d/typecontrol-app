import React from "react";
import { useGlobalState } from "../../context/GlobalStateContext";

export const Snackbar: React.FC = () => {
  const { isSnackbarVisible, snackbarConfig } = useGlobalState();
  if (!isSnackbarVisible || !snackbarConfig) return null;

  const { message, variant = "success" } = snackbarConfig;
  const baseClasses =
    "fixed z-15 bottom-4 w-full md:w-auto max-w-[calc(100vw-theme(space.12))] md:max-w-sm left-1/2 transform -translate-x-1/2 px-6 py-3 text-sm md:text-base text-center rounded-lg shadow-lg";
  // "fixed z-15 bottom-4 max-w-sm md:max-w-none w-[calc(100%-theme(space.7))] md:w-auto left-1/2 transform -translate-x-1/2 px-6 py-3 text-sm md:text-base text-center rounded-lg shadow-lg";
  const colorClasses =
    variant === "error" ? "bg-red-600 text-white" : "bg-gray-900 text-white";

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
