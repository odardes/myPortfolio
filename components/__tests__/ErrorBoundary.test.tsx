import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../ErrorBoundary';

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  let originalError: typeof console.error;

  beforeEach(() => {
    // Suppress console.error for error boundary tests
    originalError = console.error;
    console.error = jest.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Bir Hata Oluştu')).toBeInTheDocument();
    expect(screen.getByText(/Üzgünüz, beklenmeyen bir hata oluştu/i)).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom Error Message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom Error Message')).toBeInTheDocument();
    expect(screen.queryByText('Bir Hata Oluştu')).not.toBeInTheDocument();
  });

  it('should have reset button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const resetButton = screen.getByLabelText('Hatayı sıfırla ve tekrar dene');
    expect(resetButton).toBeInTheDocument();
    expect(resetButton).toHaveTextContent('Tekrar Dene');
  });

  it('should have reload button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByLabelText('Sayfayı yenile');
    expect(reloadButton).toBeInTheDocument();
    expect(reloadButton).toHaveTextContent('Sayfayı Yenile');
  });

  it('should have home button', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const homeButton = screen.getByLabelText('Ana sayfaya dön');
    expect(homeButton).toBeInTheDocument();
    expect(homeButton).toHaveTextContent('Ana Sayfa');
  });

  it('should show error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    
    // Use Object.defineProperty to override read-only property
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'development',
      writable: true,
      configurable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Hata Detayları/i)).toBeInTheDocument();

    // Restore original value
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
      configurable: true,
    });
  });

  it('should not show error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    
    // Use Object.defineProperty to override read-only property
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: 'production',
      writable: true,
      configurable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText(/Hata Detayları/i)).not.toBeInTheDocument();

    // Restore original value
    Object.defineProperty(process.env, 'NODE_ENV', {
      value: originalEnv,
      writable: true,
      configurable: true,
    });
  });

  it('should have proper accessibility attributes', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    const resetButton = screen.getByLabelText('Hatayı sıfırla ve tekrar dene');
    const reloadButton = screen.getByLabelText('Sayfayı yenile');
    const homeButton = screen.getByLabelText('Ana sayfaya dön');

    expect(resetButton).toHaveAttribute('aria-label');
    expect(reloadButton).toHaveAttribute('aria-label');
    expect(homeButton).toHaveAttribute('aria-label');
  });
});
