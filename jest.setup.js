// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import React from 'react'

// Mock ResizeObserver for Recharts
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// TextEncoder/TextDecoder are available in Node.js 18+
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// Mock ReadableStream for Firebase
if (typeof global.ReadableStream === 'undefined') {
  global.ReadableStream = class ReadableStream {
    constructor() {}
    getReader() {
      return {
        read: () => Promise.resolve({ done: true, value: undefined }),
        cancel: () => Promise.resolve(),
        releaseLock: () => {},
      };
    }
  };
}

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock document.createElement for download functions
const originalCreateElement = document.createElement;
document.createElement = jest.fn((tagName) => {
  if (tagName === 'a') {
    const link = originalCreateElement.call(document, tagName);
    link.href = '';
    link.download = '';
    link.click = jest.fn();
    return link;
  }
  return originalCreateElement.call(document, tagName);
});

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  db: null,
  auth: null,
}));

jest.mock('@/lib/cloudStorage', () => ({
  getInvestmentsFromCloud: jest.fn(() => Promise.resolve([])),
  saveInvestmentsToCloud: jest.fn(() => Promise.resolve()),
  isFirebaseAvailable: jest.fn(() => false),
}));

// Mock next/dynamic for testing - return component directly
jest.mock('next/dynamic', () => {
  return jest.fn((componentImport) => {
    // In test environment, return the component synchronously
    // This is a simplified mock - actual dynamic import happens at build time
    if (typeof componentImport === 'function') {
      // Return a function that will resolve the component
      return function DynamicComponent(props) {
        const [Component, setComponent] = React.useState(null);
        React.useEffect(() => {
          const loadComponent = async () => {
            try {
              const module = await componentImport();
              setComponent(() => module.default || module);
            } catch (e) {
              // Component failed to load in test environment
            }
          };
          loadComponent();
        }, []);
        return Component ? React.createElement(Component, props) : null;
      };
    }
    return componentImport;
  });
});
