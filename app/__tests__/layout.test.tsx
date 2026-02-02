import { render } from '@testing-library/react';
import Layout from '../layout';

describe('Layout', () => {
  it('should render layout with children', () => {
    const { container } = render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    expect(container).toBeTruthy();
  });
});
