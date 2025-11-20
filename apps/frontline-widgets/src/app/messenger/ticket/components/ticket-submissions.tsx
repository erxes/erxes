import { IconCircleMinus, IconPlus } from '@tabler/icons-react';
import { Button } from 'erxes-ui';

export const TicketSubmissions = ({
  setPage,
}: {
  setPage: (page: 'submissions' | 'submit') => void;
}) => {
  return (
    <div className="w-full h-full flex flex-col gap-3 p-3">
      <div className="flex flex-col gap-3 flex-1 w-full h-full overflow-y-auto styled-scroll">
        <TicketSubmissionEmpty />
      </div>
      <div className="flex justify-end shrink-0 px-5 gap-1">
        <Button
          type="button"
          className="flex-1 bg-primary h-8 shadow-2xs"
          onClick={() => setPage('submit')}
        >
          <IconPlus size={16} />
          Issue new ticket
        </Button>
      </div>
    </div>
  );
};

export const TicketSubmissionEmpty = () => {
  return (
    <div className="flex flex-col gap-3 items-center justify-center h-full">
      <IconCircleMinus size={64} className="text-scroll" stroke={1} />
      <div className="font-medium text-muted-foreground">
        No submissions found
      </div>
      <div className="text-accent-foreground text-xs">
        Please submit a ticket to view its details.
      </div>
    </div>
  );
};
