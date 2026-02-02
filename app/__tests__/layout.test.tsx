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
  it('should render layout with children', () => {
    // Layout renders html/body tags which can't be tested in isolation
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
