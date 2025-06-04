import React from 'react';

interface OpenSettingsButtonProps {
  onClick: () => void;
  text: string;
  icon?: React.ReactNode;
}

const OpenSettingsButton = ({ onClick, text, icon }: OpenSettingsButtonProps): React.ReactElement => {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-sm bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2"
    >
      {icon && <span>{icon}</span>}
      {text}
    </button>
  );
};

export default OpenSettingsButton;
