import { TourConfig } from "../components/overlay/GuidedTour";

/**
 * Returns the default guided tour config, localized via `t`.
 */
export function getDefaultTourConfig(
  t: (key: string) => string
): TourConfig {
  return {
    welcome: {
      title: "👋 Welcome to typeControl!",
      description: "Let’s take a quick tour to explore the main features.",
      startLabel: "Let's do it!",
      skipLabel: "Nah, I'm fine",
    },
    steps: [
      {
        target: "#scale-col",
        title: "Type scale function",
        description: "Select a ratio to calculate a size scale. You find here the typical settings",
        placement: "left-start",
      },
      {
        target: "#bezier-col",
        title: "Letter Spacing",
        description: "This is typeControl's core function. Non linear letter spacing.",
        placement: "left-start",
      },
      {
        target: "#font-col",
        title: "Font defintion",
        description: "Select here the font to display and mofify the sample text.",
        placement: "left-start",
      },
      {
        target: "#fontMode-btn",
        title: "Font Loading Mode",
        description: "Select you font here. You can user Google fonts, remote fonts and local font (sorry no safari)",
        placement: "left-start",
      },
      {
        target: "#profile-btn",
        title: "App Preferences",
        description: "Change the language, Layout and more.",
        placement: "left",
      },
      {
        target: "#table-export-btn",
        title: "Export letter spacing values",
        description: "Export as csv or HTML table to use it in your tool. TIP: Click values to copy.",
        placement: "left",
        offset: 500,
      },
    ],
  };
}
