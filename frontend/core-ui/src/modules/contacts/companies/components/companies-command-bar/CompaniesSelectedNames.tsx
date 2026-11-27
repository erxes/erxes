import { Badge, Button, Popover, TextOverflowTooltip } from 'erxes-ui';

const CompanyNameBadge = ({ name }: { name: string }) => (
  <Badge variant="secondary" className="max-w-40 font-normal">
    <TextOverflowTooltip value={name} />
  </Badge>
);

export const CompaniesSelectedNames = ({ names }: { names: string[] }) => {
  const [firstName, ...otherNames] = names;

  if (otherNames.length === 0) {
    return (
      <div className="flex items-center px-1">
        <CompanyNameBadge name={firstName} />
      </div>
    );
  }

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="ghost" className="gap-1 px-1">
          <CompanyNameBadge name={firstName} />
          <Badge variant="secondary" className="shrink-0">
            +{otherNames.length}
          </Badge>
        </Button>
      </Popover.Trigger>
      <Popover.Content
        side="top"
        sideOffset={10}
        className="max-h-64 w-72 overflow-y-auto p-1"
      >
        <ul className="divide-y">
          {names.map((name, index) => (
            <li
              key={`${name}-${index}`}
              className="flex items-center gap-2 px-2 py-1.5 text-sm"
            >
              <span className="w-6 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                {index + 1}
              </span>
              <TextOverflowTooltip value={name} />
            </li>
          ))}
        </ul>
      </Popover.Content>
    </Popover>
  );
};
