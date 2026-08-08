import { useState } from 'react';
import { PopoverScoped } from 'erxes-ui';
import { TRenderRelationValueInput } from 'ui-modules/modules/import-export/types/export/exportTypes';
import {
  SelectTicketContent,
  SelectTriggerTicket,
  SelectTriggerVariant,
} from '@/ticket/components/ticket-selects/SelectTicket';
import { SelectChannel } from '@/ticket/components/ticket-selects/SelectChannel';
import { SelectPipeline } from '@/ticket/components/ticket-selects/SelectPipeline';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';

const TicketExportStatusPicker = ({
  value,
  pipelineId,
  onValueChange,
}: {
  value: string;
  pipelineId: string;
  onValueChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const variant: `${SelectTriggerVariant}` = SelectTriggerVariant.DETAIL;

  return (
    <SelectStatusTicket.Provider
      value={value}
      pipelineId={pipelineId}
      onValueChange={(next) => {
        onValueChange(next);
        setOpen(false);
      }}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket variant={variant}>
          <SelectStatusTicket.Value />
        </SelectTriggerTicket>
        <SelectTicketContent variant={variant}>
          <SelectStatusTicket.Content />
        </SelectTicketContent>
      </PopoverScoped>
    </SelectStatusTicket.Provider>
  );
};

export const renderTicketRelationFilterValue: TRenderRelationValueInput = ({
  header,
  condition,
  allConditions,
  onChange,
}) => {
  const value = (condition.value as string) || '';

  switch (header.relationKind) {
    case 'frontline:channel':
      return <SelectChannel value={value} onValueChange={onChange} />;

    case 'frontline:pipeline': {
      const channelId =
        (allConditions.find((c) => c.key === 'channelId')?.value as string) ||
        '';
      return (
        <SelectPipeline
          value={value}
          onValueChange={onChange}
          channelId={channelId}
        />
      );
    }

    case 'frontline:status': {
      const pipelineId =
        (allConditions.find((c) => c.key === 'pipelineId')?.value as string) ||
        '';
      return (
        <TicketExportStatusPicker
          value={value}
          pipelineId={pipelineId}
          onValueChange={onChange}
        />
      );
    }

    default:
      return null;
  }
};
