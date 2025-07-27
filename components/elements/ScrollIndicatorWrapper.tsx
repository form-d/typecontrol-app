import React, { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

interface ScrollIndicatorWrapperProps {
  children: React.ReactNode;
  height?: string;
  className?: string;
  contentClassName?: string;
}

const ScrollIndicatorWrapper: React.FC<ScrollIndicatorWrapperProps> = ({
  children,
  height = "300px",
  className = "",
  contentClassName = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showBottomShadow, setShowBottomShadow] = useState(false);

  const SCROLL_TOLERANCE_PX = 15;

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;

    const atBottom =
      el.scrollTop + el.clientHeight >= el.scrollHeight - SCROLL_TOLERANCE_PX;
    setShowBottomShadow(!atBottom);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    handleScroll(); // Initial check

    el.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {children}
      {showBottomShadow && (
        <div className="pointer-events-none flex justify-center items-end sticky text-white bottom-0 left-0 pb-2 right-0 h-8 bg-gradient-to-t from-neutral-900 to-transparent">
          <Icon size="xs" iconClass="ti ti-chevron-down" />
        </div>
      )}
    </div>
  );
};

export default ScrollIndicatorWrapper;
