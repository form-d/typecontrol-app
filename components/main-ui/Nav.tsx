import React from "react";
import Link from "next/link";
import { useGlobalState } from "../../context/GlobalStateContext";

export const Nav: React.FC = () => {
  const { languages, language, setLanguage, t } = useGlobalState();
  return (
    <nav className="p-4 bg-gray-100 flex items-center justify-between">
      <div className="space-x-4">
        <Link href="/" className="text-blue-600 hover:underline">
          {t("home")}
        </Link>
        <Link href="/about" className="text-blue-600 hover:underline">
          {t("about")}
        </Link>
        <Link href="/profile" className="text-blue-600 hover:underline">
          {t("profile")}
        </Link>
      </div>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="border border-gray-300 rounded-sm p-1"
      >
        {languages.map((lng) => (
          <option key={lng} value={lng}>
            {lng.toUpperCase()}
          </option>
        ))}
      </select>
    </nav>
  );
};
