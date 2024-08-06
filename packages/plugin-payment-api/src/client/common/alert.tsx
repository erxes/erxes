import React from 'react';

const Alert = ({ children }: React.PropsWithChildren<{}>) => {
  return (
    <div
      role="alert"
      className="relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-7 border-yellow-100 text-amber-500 [&>svg]:text-amber-500 bg-yellow-100"
    >
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
        className="lucide lucide-info h-4 w-4"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
      <div className="[&_p]:leading-relaxed text-xs">{children}</div>
    </div>
  );
};

export default Alert;
