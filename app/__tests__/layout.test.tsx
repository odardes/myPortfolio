import { render } from '@testing-library/react';
import Layout from '../layout';

// Mock next/font
jest.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'inter',
    style: {},
  }),
}));

describe('Layout', () => {
  let originalError: typeof console.error;

  beforeEach(() => {
    // Suppress console.error for DOM nesting warnings in layout tests
    originalError = console.error;
    console.error = jest.fn((...args: unknown[]) => {
      // Suppress DOM nesting warnings for html/body tags in layout tests
      const message = args[0];
      if (
        typeof message === 'string' &&
        (message.includes('validateDOMNesting') || message.includes('<html>'))
      ) {
        return;
      }
      originalError(...args);
    });
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('should render layout with children', () => {
    // Layout renders html/body tags which can't be tested in isolation
    // This is expected behavior in Next.js - html/body are root-level tags
    // We just verify the component doesn't throw
    expect(() => {
      render(
        <Layout>
          <div>Test Content</div>
        </Layout>
      );
    }).not.toThrow();
  });
});
