import { IconChevronLeft } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Link } from 'react-router';

export const AutomationBotIntegrationDetailLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <div className="mx-auto p-5 w-full max-w-5xl flex flex-col gap-8">
      <div>
        <Button variant="ghost" asChild>
          <Link to="/settings/automations/bots">
            <IconChevronLeft />
            Bots
          </Link>
        </Button>
      </div>
      <div className="px-8">{children}</div>
    </div>
  );
};
