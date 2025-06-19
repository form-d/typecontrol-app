import "../styles/globals.css";
import type { AppProps } from "next/app";
import { GlobalStateProvider } from "../context/GlobalStateContext";
import { Nav } from "../components/main-ui/Nav";
import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import loaderAnimation from "../assets/typeControl.json";

function MyApp({ Component, pageProps }: AppProps) {
  const [hydrated, setHydrated] = useState(false);
  const [hideOverlay, setHideOverlay] = useState(false);
  const [fadeOverlay, setfadeOverlay] = useState(false);
  const [showLottie, setShowLottie] = useState(false);

  useEffect(() => {
    if (!hydrated) {
      setHydrated(true);
      // setTimeout(() => {
      // }, 4250);
    }
  }, [hydrated]);

  useEffect(() => {
    if (fadeOverlay) {
      // Wait for fade-out animation, then remove overlay
      const timeout = setTimeout(() => setHideOverlay(true), 1000);
      return () => clearTimeout(timeout);
    }
  }, [fadeOverlay]);

  useEffect(() => {
    // Delay for 1 second (1000 ms)
    const timer = setTimeout(() => setShowLottie(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GlobalStateProvider>
      {/* <Nav /> */}
      <link
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.31.0/dist/tabler-icons.min.css"
        rel="stylesheet"
      />
      {hydrated && <Component {...pageProps} />}
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
              onComplete={() => {
                setfadeOverlay(true);
                // Your action here, e.g., setHideOverlay(true);
              }}
            />
          )}
        </div>
      )}
    </GlobalStateProvider>
  );
}

export default MyApp;
