import { IconChevronRight } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Link } from 'react-router-dom';

type PipelineSettingsLinkProps = {
  description?: string;
  title: string;
  to: string;
};

export const PipelineSettingsLink = ({
  description,
  title,
  to,
}: PipelineSettingsLinkProps) => {
  return (
    <Button
      asChild
      className="h-auto w-full justify-between px-4 py-3 text-left"
      variant="outline"
    >
      <Link to={to}>
        <span className="flex min-w-0 flex-col gap-1">
          <span className="font-medium text-foreground">{title}</span>
          {description && (
            <span className="text-xs font-normal text-muted-foreground">
              {description}
            </span>
          )}
        </span>
        <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </Link>
    </Button>
  );
};
