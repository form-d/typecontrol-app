import "../styles/globals.css";
import type { AppProps } from "next/app";
import { GlobalStateProvider } from "../context/GlobalStateContext";
import { Nav } from "../components/main-ui/Nav";
import { useEffect, useState } from "react";

function MyApp({ Component, pageProps }: AppProps) {
  const [hydrated, setHydrated] = useState(false);
  // After SSR, React attaches event handlers and “activates” the page on the client.
  // This process is called hydration
  // Hydration expects the client-rendered HTML to match what the server sent
  useEffect(() => setHydrated(true), []);

  if (!hydrated) {
    // White full-screen
    return <div className="w-screen h-screen bg-white" />;
  }

  return (
    <GlobalStateProvider>
      {/* <Nav /> */}
      <link
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.31.0/dist/tabler-icons.min.css"
        rel="stylesheet"
      />
      <div className="fade-in">
        <Component {...pageProps} />
      </div>
    </GlobalStateProvider>
  );
}

export default MyApp;
