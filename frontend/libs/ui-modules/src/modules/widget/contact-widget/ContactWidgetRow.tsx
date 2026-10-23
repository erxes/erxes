// One record in a contact overview section: a leading mark (status, avatar),
// its title and a short detail; clicking opens the record.
export const ContactWidgetRow = ({
  leading,
  title,
  meta,
  onClick,
}: {
  leading?: React.ReactNode;
  title: React.ReactNode;
  meta?: React.ReactNode;
  onClick?: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex h-8 w-full min-w-0 items-center gap-2 rounded-sm px-2 text-left text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  >
    {leading && (
      <span className="flex flex-none items-center text-muted-foreground">
        {leading}
      </span>
    )}
    <span className="min-w-0 flex-1 truncate">{title}</span>
    {meta && (
      <span className="flex flex-none items-center gap-1 text-xs text-muted-foreground">
        {meta}
      </span>
    )}
  </button>
);
