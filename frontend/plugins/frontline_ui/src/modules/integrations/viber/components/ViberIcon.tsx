import type { SVGProps } from 'react';

export const ViberIcon = ({
  size = 24,
  ...props
}: SVGProps<SVGSVGElement> & { size?: string | number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M18 3c-4-2-9-2-12 0C3 5 3 13 5 16l3 2v4l4-4c3 0 6-1 8-3 2-3 2-9-2-12Z" />
    <path d="m9 7-2 1c0 3 5 8 8 8l2-2-3-2-1 1-3-3 1-1-2-2Zm5-1c3 0 5 2 5 5m-5-2c1 0 2 1 2 2" />
  </svg>
);
