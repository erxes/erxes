import {
  Combobox,
  PopoverScoped,
  TPropertyInputMeta,
  TPropertyInputProps,
} from 'erxes-ui';
import { useState } from 'react';

import { SelectChannel } from '@/ticket/components/ticket-selects/SelectChannel';
import { SelectPipeline } from '@/ticket/components/ticket-selects/SelectPipeline';
import { SelectStatusTicket } from '@/ticket/components/ticket-selects/SelectStatusTicket';

const getMetaValue = (meta: TPropertyInputMeta | undefined, key: string) => {
  const value = meta?.[key];

  return typeof value === 'string' ? value : '';
};

const selectWrapperClassName =
  '[&_[role=combobox]]:w-full [&_[role=combobox]]:max-w-none';

export const TicketStatusPropertyInput = ({
  value,
  onValueChange,
  meta,
  onMetaChange,
  disabled,
}: TPropertyInputProps) => {
  const channelId = getMetaValue(meta, 'channelId');
  const pipelineId = getMetaValue(meta, 'pipelineId');
  const [open, setOpen] = useState(false);

  return (
    <SelectStatusTicket.Provider
      value={value}
      pipelineId={pipelineId}
      onValueChange={(nextValue) => {
        onValueChange(nextValue);
        setOpen(false);
      }}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <Combobox.TriggerBase
          className="w-full h-7 font-medium max-w-none"
          disabled={disabled}
        >
          <SelectStatusTicket.Value />
        </Combobox.TriggerBase>
        <Combobox.Content
          className="w-80 max-w-[calc(100vw-2rem)] p-0"
          sideOffset={8}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-1 gap-2 border-b p-2">
            <div className={selectWrapperClassName}>
              <SelectChannel
                value={channelId}
                disabled={disabled}
                onValueChange={(nextChannelId) => {
                  onMetaChange({
                    ...(meta || {}),
                    channelId: nextChannelId,
                    pipelineId: '',
                  });
                  onValueChange('');
                }}
              />
            </div>
            <div className={selectWrapperClassName}>
              <SelectPipeline
                value={pipelineId}
                channelId={channelId}
                disabled={disabled || !channelId}
                onValueChange={(nextPipelineId) => {
                  onMetaChange({
                    ...(meta || {}),
                    channelId,
                    pipelineId: nextPipelineId,
                  });
                  onValueChange('');
                }}
              />
            </div>
          </div>
          <SelectStatusTicket.Content />
        </Combobox.Content>
      </PopoverScoped>
    </SelectStatusTicket.Provider>
  );
};
