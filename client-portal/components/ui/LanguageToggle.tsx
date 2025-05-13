import React, { useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';
import { Globe2 } from 'lucide-react'; // or use a globe emoji if you prefer 🌐

const LanguageDropdown: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [languages, setLanguages] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('languages');

    try {
      const parsed = stored ? JSON.parse(stored) : [];
      if (Array.isArray(parsed)) {
        setLanguages(parsed);
      }
    } catch (error) {
      console.error('Invalid languages in localStorage:', error);
      setLanguages([]);
    }
  }, []);

  const currentLangLabel = languages.find((lang) => lang === language) || language;

  return (
    <div className="relative">
      <Dropdown>
        <Dropdown.Toggle
          variant="light"
          id="language-dropdown"
          className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100"
        >
          {/* <Globe2 className="w-4 h-4 text-gray-600" /> */}
          🌐 <span className="text-gray-800">{currentLangLabel}</span>
        </Dropdown.Toggle>

        <Dropdown.Menu className="dropdown-menu">
          {languages.map((lang) => (
            <Dropdown.Item
              key={lang}
              onClick={() => {

              }}
              active={lang === language}
              className="text-sm px-4 py-2 hover:bg-gray-100"
            >
              {lang.toUpperCase()}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default LanguageDropdown;
