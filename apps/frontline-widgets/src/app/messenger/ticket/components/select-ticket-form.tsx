import { useAtomValue, useSetAtom } from 'jotai';
import {
  selectedTicketConfigAtom,
  ticketConfigsAtom,
  ticketTabAtom,
} from '../../states';
import { ComponentPropsWithoutRef, FC } from 'react';
import { Button, cn } from 'erxes-ui';
import { ITicketConfig } from '../../types';
import { IconCategory, IconChevronRight, IconLogs } from '@tabler/icons-react';

export const SelectTicketForm = () => {
  const ticketConfigs = useAtomValue(ticketConfigsAtom);
  const setPage = useSetAtom(ticketTabAtom);
  return (
    <section className="flex flex-col flex-1 h-full items-center justify-start p-4 overflow-hidden">
      <span className="font-mono uppercase self-start ps-2 mb-2 text-muted-foreground font-semibold text-sm flex-0">
        Choose a ticket form
      </span>
      <div className="flex flex-col gap-2 flex-1 w-full overflow-y-auto hide-scroll styled-scroll">
        {ticketConfigs &&
          ticketConfigs.map((form) => (
            <TicketFormCallout key={form._id} form={form} />
          ))}
      </div>
      <div className="flex-0 w-full mt-2">
        <Button className="w-full" onClick={() => setPage('submissions')}>
          <IconLogs />
          View my submissions
        </Button>
      </div>
    </section>
  );
};

export const TicketFormCallout: FC<
  Omit<ComponentPropsWithoutRef<typeof Button>, 'form'> & {
    form: ITicketConfig;
  }
> = ({ className, form, ...props }) => {
  const setTicketForm = useSetAtom(selectedTicketConfigAtom);
  return (
    <Button
      className={cn('text-foreground h-auto gap-3', className)}
      variant={'outline'}
      onClick={() => setTicketForm(form)}
      {...props}
    >
      <div className="flex-0">
        <IconCategory size={20} />
      </div>
      <div className="flex-1 flex text-base flex-col gap-0.5 items-start">
        <span>{form.name}</span>
        <span className="text-xs text-muted-foreground">Issue a ticket</span>
      </div>
      <div className="flex-0">
        <IconChevronRight size={16} />
      </div>
    </Button>
  );
};
