"use client";
import React, { useEffect, useRef } from "react";
import { useGlobalState } from "../context/GlobalStateContext";
import GraphCanvas from "../components/main-ui/GraphCanvas";
import FontSizeTable from "../components/main-ui/FontSizeTable";
import FontPreviewList from "../components/main-ui/FontPreviewList";
import ControlPanel from "../components/main-ui/ControlPanel";
import Layout from "../components/layout/Layout";
import { getDefaultTourConfig } from "../context/tourConfig";

export default function Home() {
  const { settings, sizes, bezier, t, openTour } = useGlobalState();
  const hasMountedRef = useRef(false);

  const tour = getDefaultTourConfig(t);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      openTour(tour);
    }
  }, []);

  return (
    <Layout orientation={settings.layout} bar={<ControlPanel sizes={sizes} />}>
      <div className="">
        <div className="mx-auto h-[50vh] md:h-auto overflow-auto">
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
          <div className="space-y-4 my-8 hidden lg:block px-1 md:px-10">
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
}
