import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '../ThemeToggle';
import { ThemeProvider } from '@/contexts/ThemeContext';

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider>{component}</ThemeProvider>);
};

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render theme toggle button', () => {
    renderWithTheme(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should toggle theme on click', () => {
    renderWithTheme(<ThemeToggle />);
    const button = screen.getByRole('button');
    
    // Initial state should be system
    expect(button).toHaveAttribute('title', 'Sistem');
    
    // Click to go to light
    fireEvent.click(button);
    expect(button).toHaveAttribute('title', 'Açık Mod');
    
    // Click to go to dark
    fireEvent.click(button);
    expect(button).toHaveAttribute('title', 'Koyu Mod');
    
    // Click to go back to system
    fireEvent.click(button);
    expect(button).toHaveAttribute('title', 'Sistem');
  });

  it('should save theme to localStorage', () => {
    renderWithTheme(<ThemeToggle />);
    const button = screen.getByRole('button');
    
    fireEvent.click(button);
    expect(localStorage.getItem('theme')).toBe('light');
    
    fireEvent.click(button);
    expect(localStorage.getItem('theme')).toBe('dark');
  });
});
