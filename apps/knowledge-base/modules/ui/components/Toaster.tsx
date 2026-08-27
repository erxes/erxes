'use client';

/**
 * `erxes-ui` ships the toaster without a `'use client'` directive, so it is
 * re-exported through this client boundary before the server layout mounts it.
 */
export { Toaster } from 'erxes-ui/components/toaster';
