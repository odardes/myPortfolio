import { renderHook, waitFor } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 300));
    expect(result.current).toBe('test');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 100 },
      }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated', delay: 100 });
    
    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Wait for debounce
    await waitFor(
      () => {
        expect(result.current).toBe('updated');
      },
      { timeout: 200 }
    );
  });

  it('should handle number values', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 0, delay: 100 },
      }
    );

    rerender({ value: 100, delay: 100 });

    await waitFor(
      () => {
        expect(result.current).toBe(100);
      },
      { timeout: 200 }
    );
  });

  it('should handle different delay values', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 200 },
      }
    );

    rerender({ value: 'updated', delay: 200 });

    // Should still be initial after short wait
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(result.current).toBe('initial');

    // Should be updated after full delay
    await waitFor(
      () => {
        expect(result.current).toBe('updated');
      },
      { timeout: 200 }
    );
  });
});
