// Pulls a page's first breadcrumb out by its button's padding, so its icon
// lines up with the page's content (12px in) rather than its button. A nested
// breadcrumb further along is left alone.
export const PAGE_HEADER_FIRST_CRUMB_CLASS_NAME =
  '[&>nav:first-of-type>ol>li:first-child_a]:-ml-2 [&>nav:first-of-type>ol>li:first-child_a]:pl-2 [&>nav:first-of-type>ol>li:first-child_button]:-ml-2 [&>nav:first-of-type>ol>li:first-child_button]:pl-2';
