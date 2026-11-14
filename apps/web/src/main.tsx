// Async boundary: Module Federation agrees on shared libraries with plugin
// remotes before any of them is evaluated.
import('./bootstrap').catch((error: unknown) => {
  console.error('erxes failed to start', error);
});
