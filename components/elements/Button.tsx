import React from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "text"
  | "subtle";
export type ButtonSize = "small" | "standard" | "large";

interface ButtonProps {
  /** Button content */
  children: React.ReactNode;
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size of the button */
  size?: ButtonSize;
  /** Icon rendered before the label */
  startIcon?: React.ReactNode;
  /** Icon rendered after the label */
  endIcon?: React.ReactNode;
  /** Additional Tailwind classes */
  className?: string;
  /** Click handler */
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  /** Disable state */
  disabled?: boolean;
  /** Loading state */
  isLoading?: boolean;
  /** Loading text */
  loadingText?: string;
  id?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-black hover:bg-primary-dark glow",
  secondary: "bg-neutral-200 text-neutral-800 hover:bg-neutral-300",
  tertiary: "border border-neutral-300 text-neutral-800 hover:bg-neutral-100",
  text: "bg-transparent text-primary-darker hover:underline",
  subtle: "bg-transparent text-purple-600 hover:underline",
};

const sizeClasses: Record<ButtonSize, string> = {
  small: "text-sm py-1.5 px-3 min-h-8",
  standard: "text-sm py-2 px-4",
  large: "text-lg py-3 px-6",
};

// Map spinner size to button size
const spinnerSizeClasses: Record<ButtonSize, string> = {
  small: "w-4 h-4",
  standard: "w-5 h-5",
  large: "w-6 h-6",
};

/**
 * Universal Button component
 *
 * @example
 * <Button
 *   variant="primary"
 *   size="standard"
 *   isLoading={true}
 *   loadingText="Submitting..."
 * >
 *   Submit
 * </Button>
 */
const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "standard",
  startIcon,
  endIcon,
  className = "",
  onClick,
  disabled = false,
  isLoading = false,
  loadingText = "Loading...",
  id,
}) => {
  // const isDisabled = disabled;
  const isDisabled = disabled || isLoading;
  const baseClasses =
    "inline-flex items-center font-medium leading-none rounded-xl focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-offset-2";
  const vClasses = variantClasses[variant];
  const sClasses = sizeClasses[size];
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  // const disabledClasses = isDisabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={`${baseClasses} ${vClasses} ${sClasses} ${disabledClasses} ${className}`}
    >
      {isLoading ? (
        <span className="inline-flex items-center">
          <svg
            aria-hidden="true"
            role="status"
            className={`${spinnerSizeClasses[size]} mr-2 text-current animate-spin`}
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 
                 50 100.591C22.3858 100.591 0 78.2051 0 
                 50.5908C0 22.9766 22.3858 0.59082 50 
                 0.59082C77.6142 0.59082 100 22.9766 100 
                 50.5908ZM9.08144 50.5908C9.08144 73.1895 
                 27.4013 91.5094 50 91.5094C72.5987 91.5094 
                 90.9186 73.1895 90.9186 50.5908C90.9186 
                 27.9921 72.5987 9.67226 50 9.67226C27.4013 
                 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="#ffffff"
              opacity="0.35"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 
                 35.9116 97.0079 33.5539C95.2932 28.8227 
                 92.871 24.3692 89.8167 20.348C85.8452 
                 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 
                 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 
                 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 
                 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 
                 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 
                 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 
                 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 
                 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 
                 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 
                 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentColor"
            />
          </svg>
          <span>{loadingText}</span>
        </span>
      ) : (
        <>
          {startIcon && (
            <span className="mr-2 flex items-center">{startIcon}</span>
          )}
          <span>{children}</span>
          {endIcon && <span className="ml-2 flex items-center">{endIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
