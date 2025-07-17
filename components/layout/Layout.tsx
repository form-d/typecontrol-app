import React, { ReactNode, useEffect, useRef, useState } from "react";

interface LayoutProps {
  /**
   * 'top' = bar on top (sticky), main content scrolls beneath
   * 'left' = bar on left, main content to the right
   */
  orientation?: "top" | "left";
  /** The content of the bar (e.g. nav links, logo) */
  bar: ReactNode;
  /** The main area content */
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  orientation = "top",
  bar,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [effectiveLayout, setEffectiveLayout] = useState<"top" | "left">(
    orientation
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        if (width < 768) {
          setEffectiveLayout("top");
        } else if (width < 1400) {
          setEffectiveLayout("left");
        } else {
          setEffectiveLayout(orientation);
        }
      }
    });

    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, [orientation]);

  // orientation = "left";

  const isTop = effectiveLayout === "top";

  // Container switches between horizontal or vertical layout
  const containerClasses = isTop ? "flex flex-col" : "flex flex-row";
  // (isTop ? "flex flex-col" : "flex flex-row") + " h-screen";

  return (
    <div ref={containerRef} className={`dark ${containerClasses}`}>
      {isTop ? (
        // Sticky top bar: transparent background, stays at top while content scrolls
        <aside className="h-[45vh] md:h-auto sticky top-0 w-full z-10">
          <div className="p-4 h-full overflow-auto bg-white/60 dark:bg-black/90 backdrop-blur-[32px] p-4 space-y-4 rounded-2xl m-3 shadow-lg/20 dark:shadow-none">
            {bar}
          </div>
        </aside>
      ) : (
        // Sidebar on left
        <aside className="w-96 md:sticky  top-0 h-screen p-2">
          <div className="bg-black/90 p-4 overflow-scroll rounded-2xl h-full">
            {bar}
          </div>
        </aside>
      )}

      <main className="flex-1 overflow-auto md:py-2 ">{children}</main>
    </div>
  );
};

export default Layout;

// ----------- Usage Example -----------
//
// <Layout orientation="top" bar={<Header /> }>
//   <Dashboard />
// </Layout>
//
// or
//
// <Layout orientation="left" bar={<Sidebar /> }>
//   <Dashboard />
// </Layout>
