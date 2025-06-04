import React from "react";
import Button from "../elements/Button";

interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Handler to close the modal */
  onClose: () => void;
  /** Main content of the modal */
  children: React.ReactNode;
  /** Optional primary action button */
  primaryButton?: {
    label: string;
    onClick: () => void;
    /** Additional Tailwind classes */
    className?: string;
  };
  /** Optional secondary action button */
  secondaryButton?: {
    label: string;
    onClick: () => void;
    /** Additional Tailwind classes */
    className?: string;
  };
  /** Close modal when clicking on backdrop */
  closeOnBackdropClick?: boolean;
  /** Show or hide the top-right close (✕) button */
  showCloseButton?: boolean;
}

/**
 * Modal component with optional footer, close button, and backdrop click handling
 *
 * Usage Example:
 * <Modal
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   primaryButton={{ label: 'Confirm', onClick: handleConfirm }}
 *   secondaryButton={{ label: 'Cancel', onClick: handleCancel }}
 *   closeOnBackdropClick
 *   showCloseButton={false}
 * >
 *   <p>Your content here</p>
 * </Modal>
 */
const Modal = ({
  isOpen,
  onClose,
  children,
  primaryButton,
  secondaryButton,
  closeOnBackdropClick = false,
  showCloseButton = true,
}: ModalProps): React.ReactElement | null => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={closeOnBackdropClick ? onClose : undefined}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Optional Close button */}
        {showCloseButton && (
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-black dark:hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Modal content */}
        <div className="mt-4">{children}</div>

        {/* Optional footer */}
        {(primaryButton || secondaryButton) && (
          <div className="mt-6 border-t pt-4 flex justify-end space-x-2">
            {secondaryButton && (
              <Button
                variant="secondary"
                size="standard"
                onClick={secondaryButton.onClick}
                className={secondaryButton.className}
              >
                {secondaryButton.label}
              </Button>
            )}
            {primaryButton && (
              <Button
                variant="primary"
                size="standard"
                onClick={primaryButton.onClick}
                className={primaryButton.className}
              >
                {primaryButton.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
