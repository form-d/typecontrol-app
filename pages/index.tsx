import React, { useMemo } from "react";
import { useGlobalState } from "../context/GlobalStateContext";
import GraphCanvas from "../components/main-ui/GraphCanvas";
import FontSizeTable from "../components/main-ui/FontSizeTable";
import FontPreviewList from "../components/main-ui/FontPreviewList";
import ControlPanel from "../components/main-ui/ControlPanel";
import Layout from "../components/layout/Layout";

const Home: React.FC = () => {
  const { settings, sizes, bezier } = useGlobalState();

  return (
    <Layout orientation={settings.layout} bar={<ControlPanel sizes={sizes} />}>
      <div className="">
        <div className="mx-auto px-1 md:px-10">
          <FontPreviewList
            sizes={sizes}
            selectedSize={settings.selectedSize}
            bezier={bezier}
            letterSpacing={settings.letterSpacing}
            letterSpacingPercent={settings.letterSpacingPercent}
          />

          <FontSizeTable
            sizes={sizes}
            selectedSize={settings.selectedSize}
            bezier={bezier}
            letterSpacing={settings.letterSpacing}
            letterSpacingPercent={settings.letterSpacingPercent}
          />

          <div className="space-y-4 my-8 max-w-1900 hidden lg:block">
            <GraphCanvas
              sizes={sizes}
              selectedSize={settings.selectedSize}
              bezier={bezier}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
