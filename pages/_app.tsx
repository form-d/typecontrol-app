import "../styles/globals.css";
import type { AppProps } from "next/app";
import { GlobalStateProvider } from "../context/GlobalStateContext";
import { Nav } from "../components/main-ui/Nav";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <GlobalStateProvider>
      {/* <Nav /> */}
      <link
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.31.0/dist/tabler-icons.min.css"
        rel="stylesheet"
      />
      <Component {...pageProps} />
    </GlobalStateProvider>
  );
}

export default MyApp;
