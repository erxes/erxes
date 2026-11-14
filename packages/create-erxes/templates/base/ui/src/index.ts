// The remote has no page of its own: web loads ./config and ./__id__.
// Module Federation needs an async boundary before shared modules load.
void import('./config.tsx');
