import React from 'react';

export const LoaderIcon = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={'animate-spin' + ' ' + className}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const Loader = ({
  children,
  className
}: React.PropsWithChildren<{ className?: string }>) => (
  <div
    className={
      'absolute inset-0 flex justify-center items-center' + ' ' + className
    }
  >
    <LoaderIcon className={children ? 'mr-2' : ''} />
    {children}
  </div>
);

export default Loader;
