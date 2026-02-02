import { isFirebaseAvailable } from '../cloudStorage';

describe('cloudStorage', () => {
  it('should check if cloud is available', () => {
    const result = isFirebaseAvailable();
    expect(typeof result).toBe('boolean');
  });
});
