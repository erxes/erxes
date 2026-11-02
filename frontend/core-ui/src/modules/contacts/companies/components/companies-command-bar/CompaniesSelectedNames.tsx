import { Button, Popover } from 'erxes-ui';

export const CompaniesSelectedNames = ({ names }: { names: string[] }) => {
  const [firstName, ...otherNames] = names;

  if (otherNames.length === 0) {
    return (
      <span className="max-w-48 truncate px-2 text-sm font-medium">
        {firstName}
      </span>
    );
  }

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="ghost">
          <span className="max-w-40 truncate">{firstName}</span>
          <span className="text-muted-foreground">+{otherNames.length}</span>
        </Button>
      </Popover.Trigger>
      <Popover.Content
        side="top"
        sideOffset={10}
        className="flex max-h-60 w-64 flex-col gap-1 overflow-y-auto p-2"
      >
        {names.map((name, index) => (
          <span key={`${name}-${index}`} className="truncate text-sm">
            {name}
          </span>
        ))}
      </Popover.Content>
    </Popover>
  );
};
