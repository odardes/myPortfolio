import { render, screen } from '@testing-library/react';
import SkeletonLoader from '../SkeletonLoader';

describe('SkeletonLoader', () => {
  it('should render card skeleton by default', () => {
    render(<SkeletonLoader />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-label', 'Yükleniyor');
  });

  it('should render card skeleton', () => {
    render(<SkeletonLoader type="card" />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
  });

  it('should render list skeleton', () => {
    render(<SkeletonLoader type="list" />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
  });

  it('should render chart skeleton', () => {
    render(<SkeletonLoader type="chart" />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
  });

  it('should render form skeleton', () => {
    render(<SkeletonLoader type="form" />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toBeInTheDocument();
  });

  it('should render multiple skeletons when count > 1', () => {
    render(<SkeletonLoader type="card" count={3} />);
    const skeletons = screen.getAllByText('İçerik yükleniyor...');
    expect(skeletons).toHaveLength(1); // sr-only text appears once
    const container = screen.getByRole('status');
    expect(container.children.length).toBeGreaterThan(1);
  });

  it('should have animate-pulse class', () => {
    render(<SkeletonLoader />);
    const skeleton = screen.getByRole('status');
    const animatedElement = skeleton.querySelector('.animate-pulse');
    expect(animatedElement).toBeInTheDocument();
  });

  it('should have aria-live attribute', () => {
    render(<SkeletonLoader />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveAttribute('aria-live', 'polite');
  });

  it('should accept custom className', () => {
    render(<SkeletonLoader className="custom-class" />);
    const skeleton = screen.getByRole('status');
    expect(skeleton).toHaveClass('custom-class');
  });

  it('should have sr-only text for screen readers', () => {
    render(<SkeletonLoader />);
    const srText = screen.getByText('İçerik yükleniyor...');
    expect(srText).toHaveClass('sr-only');
  });
});
