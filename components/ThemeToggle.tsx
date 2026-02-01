'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'light') {
      return <Sun className="w-5 h-5" />;
    } else if (theme === 'dark') {
      return <Moon className="w-5 h-5" />;
    } else {
      return <Monitor className="w-5 h-5" />;
    }
  };

  const getLabel = () => {
    if (theme === 'light') {
      return 'Açık Mod';
    } else if (theme === 'dark') {
      return 'Koyu Mod';
    } else {
      return 'Sistem';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Tema değiştir"
      title={getLabel()}
    >
      {getIcon()}
      <span className="hidden sm:inline text-sm font-medium">{getLabel()}</span>
    </button>
  );
}
