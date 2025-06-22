"use client";
import "../styles/globals.css";
import { GlobalStateProvider } from "../context/GlobalStateContext";
import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import loaderAnimation from "../assets/typeControl.json";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hydrated, setHydrated] = useState(false);
  const [hideOverlay, setHideOverlay] = useState(false);
  const [fadeOverlay, setfadeOverlay] = useState(false);
  const [showLottie, setShowLottie] = useState(false);

  useEffect(() => {
    if (!hydrated) setHydrated(true);
  }, [hydrated]);

  useEffect(() => {
    if (fadeOverlay) {
      const timeout = setTimeout(() => setHideOverlay(true), 1000);
      return () => clearTimeout(timeout);
    }
  }, [fadeOverlay]);

  useEffect(() => {
    const timer = setTimeout(() => setShowLottie(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.31.0/dist/tabler-icons.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <GlobalStateProvider>
          {hydrated && children}
          {!hideOverlay && (
            <div
              className={`fixed inset-0 z-50 bg-white flex items-center justify-center ${
                fadeOverlay ? "fade-out pointer-events-none" : ""
              }`}
            >
              {showLottie && (
                <Lottie
                  animationData={loaderAnimation}
                  loop={false}
                  autoplay
                  style={{ width: 220, height: 40 }}
                  onComplete={() => setfadeOverlay(true)}
                />
              )}
            </div>
          )}
        </GlobalStateProvider>
      </body>
    </html>
  );
}

// export const metadata = {
//   icons: {
//     icon: [
//       { url: "/favicon.ico", sizes: "any" },
//       { url: "/favicon.svg", type: "image/svg+xml" },
//     ],
//     apple: [{ url: "/apple-touch-icon.png" }],
//   },
// };
