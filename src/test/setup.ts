import '@testing-library/jest-dom';

// Polyfill window.scrollTo for jsdom
if (typeof window !== 'undefined') {
  window.scrollTo = () => {};
}
