import {
  Combobox,
  PopoverScoped,
  TPropertyInputMeta,
  TPropertyInputProps,
} from 'erxes-ui';
import { useState } from 'react';

import { SelectStatusTask } from '@/task/components/task-selects/SelectStatusTask';
import { SelectTeam } from '@/team/components/SelectTeam';

const getMetaValue = (meta: TPropertyInputMeta | undefined, key: string) =>
  typeof meta?.[key] === 'string' ? (meta[key] as string) : '';

const selectWrapperClassName =
  '[&_[role=combobox]]:w-full [&_[role=combobox]]:max-w-none';

export const TaskStatusPropertyInput = ({
  value,
  onValueChange,
  meta,
  onMetaChange,
  disabled,
}: TPropertyInputProps) => {
  const teamId = getMetaValue(meta, 'teamId');
  const [open, setOpen] = useState(false);

  return (
    <SelectStatusTask.Provider
      value={value}
      teamId={teamId}
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
          <SelectStatusTask.Value />
        </Combobox.TriggerBase>
        <Combobox.Content
          className="w-80 max-w-[calc(100vw-2rem)] p-0"
          sideOffset={8}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="grid grid-cols-1 gap-2 border-b p-2">
            <div className={selectWrapperClassName}>
              <SelectTeam.FormItem
                mode="single"
                value={teamId}
                onValueChange={(nextTeamId) => {
                  onMetaChange({
                    ...(meta || {}),
                    teamId: nextTeamId as string,
                  });
                  onValueChange('');
                }}
              />
            </div>
          </div>
          <SelectStatusTask.Content />
        </Combobox.Content>
      </PopoverScoped>
    </SelectStatusTask.Provider>
  );
};
