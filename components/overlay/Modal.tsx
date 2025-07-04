import React, { useRef, useState, useEffect } from "react";
import { useGlobalState, ModalConfig } from "../../context/GlobalStateContext";
import Button from "../elements/Button";
import IconOnlyButton from "../elements/IconOnlyButton";
import Icon from "../elements/Icon";
import Divider from "../elements/Divider";

/**
 * Global Modal component with fade-in/out, optional fallback Close button, and optional header X button.
 *
 * Config options in ModalConfig:
 * - title: string
 * - content: ReactNode
 * - primaryButton?: { label: string; action: () => void }
 * - secondaryButton?: { label: string; action: () => void }
 * - closeOnBackdropClick?: boolean
 * - suppressCloseButton?: boolean
 * - showHeaderCloseButton?: boolean
 */
export const Modal: React.FC = () => {
  const { isModalOpen, modalConfig, closeModal } = useGlobalState();
  const {
    title,
    content,
    primaryButton,
    secondaryButton,
    closeOnBackdropClick = true,
    suppressCloseButton = false,
    showHeaderCloseButton = false,
    centered = false,
  } = (modalConfig as ModalConfig) || {};

  const [isRendered, setIsRendered] = useState(isModalOpen);
  const [fadeState, setFadeState] = useState<"in" | "out">("out");

  // 1. Track overflow state
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [isContentOverflowing, setIsContentOverflowing] = useState(false);

  // 2. Use ResizeObserver for dynamic content and resizing
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const checkOverflow = () => {
      setIsContentOverflowing(el.scrollHeight > el.clientHeight);
    };

    checkOverflow();

    // Use ResizeObserver for both size and content changes
    const resizeObserver = new window.ResizeObserver(checkOverflow);
    resizeObserver.observe(el);

    // In case parent/container changes (modal resizing), observe parent too:
    if (el.parentElement) {
      resizeObserver.observe(el.parentElement);
    }

    // Also update on window resize for good measure
    window.addEventListener("resize", checkOverflow);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", checkOverflow);
    };
  }, [content, isRendered]); // run again when modal appears or content changes

  // Fade-in/out effect logic (unchanged)
  useEffect(() => {
    let timer: number;
    if (isModalOpen) {
      setIsRendered(true);
      setFadeState("out");
      timer = window.setTimeout(() => setFadeState("in"), 20);
    } else if (isRendered) {
      setFadeState("out");
      timer = window.setTimeout(() => setIsRendered(false), 300);
    }
    return () => clearTimeout(timer);
  }, [isModalOpen, isRendered]);

  if (!isRendered) return null;

  const backdropBase =
    "fixed flex items-center justify-center inset-0 bg-black/50 z-50 transition-opacity duration-300";
  const panelBase =
    "flex flex-col max-w-xl bg-white mx-4 rounded-lg min-w-[300px] max-h-[calc(100%-2rem)] ease-in-out transition-all duration-300 delay-150";
  const opacityClass = fadeState === "in" ? "opacity-100" : "opacity-0";
  const motionClass = fadeState === "in" ? "mb-0" : "-mb-10";

  return (
    <div
      className={`${backdropBase} ${opacityClass}`}
      onClick={closeOnBackdropClick ? closeModal : undefined}
    >
      <div
        className={`${panelBase} ${opacityClass} ${motionClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Title and optional X button */}
        {(title || showHeaderCloseButton) && (
          <div
            className={
              centered
                ? "flex flex-col items-center px-5 py-4"
                : "flex justify-between items-center px-5 py-4"
            }
          >
            {title && (
              <h2
                className={`text-xl font-semibold ${
                  centered ? "text-center w-full" : ""
                }`}
              >
                {title}
              </h2>
            )}
            {showHeaderCloseButton && !centered && (
              <IconOnlyButton
                id="profile-btn"
                ariaLabel="Close modal"
                variant="text"
                icon={<Icon size="md" iconClass="ti ti-x" />}
                onClick={closeModal}
              />
            )}
          </div>
        )}
        {/* Divider only if content is overflowing */}
        {/* {isContentOverflowing && <Divider spacing="none" />} */}
        {/* Content */}
        <div
          ref={contentRef}
          className={`overflow-y-auto px-5 pb-5 ${
            centered ? "text-center" : ""
          }`}
          style={{ flex: 1, minHeight: 0 }} // ensures proper scrolling with flex layout
        >
          {content}
        </div>
        {/* Footer actions */}
        {(primaryButton || secondaryButton || !suppressCloseButton) && (
          <div>
            {/* Divider only if content is overflowing */}
            {isContentOverflowing && <Divider spacing="none" />}
            <div
              className={`px-5 py-4 flex gap-3 ${
                centered ? "justify-center" : "justify-end"
              }`}
            >
              {secondaryButton && (
                <Button
                  variant="text"
                  onClick={() => {
                    secondaryButton.action();
                    closeModal();
                  }}
                >
                  {secondaryButton.label}
                </Button>
              )}
              {primaryButton && (
                <Button
                  variant="primary"
                  onClick={() => {
                    primaryButton.action();
                    closeModal();
                  }}
                >
                  {primaryButton.label}
                </Button>
              )}
              {!primaryButton && !secondaryButton && !suppressCloseButton && (
                <Button variant="secondary" onClick={closeModal}>
                  Close
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
