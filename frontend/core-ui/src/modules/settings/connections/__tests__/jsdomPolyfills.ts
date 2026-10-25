import { TextDecoder, TextEncoder } from 'util';

// jsdom lacks these: React Router needs the encoders at import time, cmdk and
// Radix popovers/selects and the record table need the observers and
// pointer/scroll methods.
Object.assign(globalThis, { TextEncoder, TextDecoder });

class ResizeObserverStub {
  observe() {
    return undefined;
  }

  unobserve() {
    return undefined;
  }

  disconnect() {
    return undefined;
  }
}

class IntersectionObserverStub extends ResizeObserverStub {
  takeRecords() {
    return [];
  }
}

Object.assign(globalThis, {
  ResizeObserver: ResizeObserverStub,
  IntersectionObserver: IntersectionObserverStub,
});

Element.prototype.scrollIntoView = function scrollIntoView() {
  return undefined;
};
Element.prototype.hasPointerCapture = function hasPointerCapture() {
  return false;
};
Element.prototype.releasePointerCapture = function releasePointerCapture() {
  return undefined;
};
