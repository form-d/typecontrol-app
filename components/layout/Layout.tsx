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
    <div ref={containerRef} className={containerClasses}>
      {isTop ? (
        // Sticky top bar: transparent background, stays at top while content scrolls
        <aside className="md:sticky top-0 w-full z-10 p-4 bg-white/70 backdrop-blur-[32px] border border-b-black/15 p-4 space-y-4">
          {bar}
        </aside>
      ) : (
        // Sidebar on left
        <aside className="w-96 md:sticky top-0 border border-r-black/15 p-4 h-screen overflow-scroll">
          {bar}
        </aside>
      )}

      <main className="flex-1 overflow-auto md:p-6 ">{children}</main>
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
