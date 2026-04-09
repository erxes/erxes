import { useState } from 'react';

type Props = {
  title: string;
  count?: number;
  children: React.ReactNode;
};

const AccordionSection = ({ title, count, children }: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-md overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50"
        onClick={() => setOpen(!open)}
      >
        <div className="font-medium text-left">
          {title} {count ? `(${count})` : ''}
        </div>

        <span>{open ? '▾' : '▸'}</span>
      </button>

      {open && <div className="p-4">{children}</div>}
    </div>
  );
};

export default AccordionSection;
