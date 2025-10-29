import {
  CommandBar,
  Separator,
  RecordTable,
  Button,
  Avatar,
  readImage,
  Popover,
  Command,
} from 'erxes-ui';
import { Row } from '@tanstack/table-core';
import { ITask } from '@/task/types';
import { IconRepeat, IconTrash } from '@tabler/icons-react';
import { currentUserState } from 'ui-modules';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import {
  TasksEditStatusTrigger,
  TasksEditStatusContent,
} from './TasksEditStatus';
import {
  TasksAddProjectTrigger,
  TasksAddProjectContent,
} from './TasksAddProject';
import {
  TasksEditPriorityTrigger,
  TasksEditPriorityContent,
} from './TasksEditPriority';

export const TasksCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const currentUser = useAtomValue(currentUserState);
  const taskIds = table
    .getFilteredSelectedRowModel()
    .rows.map((row: Row<ITask>) => row.original._id);
  console.log(taskIds);

  const [currentContent, setCurrentContent] = useState<string>('main');

  console.log(currentContent);
  return (
    <CommandBar open={table.getFilteredSelectedRowModel().rows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>
          {table.getFilteredSelectedRowModel().rows.length} selected
        </CommandBar.Value>
        <Separator.Inline />
        <Popover
          onOpenChange={() => {
            setTimeout(() => {
              setCurrentContent('main');
            }, 100);
          }}
        >
          <Popover.Trigger asChild>
            <Button variant="secondary">
              <IconRepeat />
              Actions
            </Button>
          </Popover.Trigger>
          <Popover.Content
            className="min-w-[280px] p-0"
            align="end"
            side="top"
            sideOffset={10}
          >
            {currentContent === 'main' && (
              <Command>
                <Command.Input></Command.Input>
                <Command.List className="p-0">
                  <Command.Group className="p-1">
                    <Command.Item className="w-full">
                      <div className="flex gap-2 justify-start">
                        <div className="flex items-center justify-center">
                          <Avatar className="size-4">
                            <Avatar.Image
                              src={readImage(currentUser.details.avatar)}
                            />
                            <Avatar.Fallback className="text-xs">
                              {currentUser.details.fullName.charAt(0) || '-'}
                            </Avatar.Fallback>
                          </Avatar>
                        </div>
                        Assign to me
                      </div>
                    </Command.Item>
                    <TasksEditStatusTrigger
                      setCurrentContent={setCurrentContent}
                    />
                    <TasksEditPriorityTrigger
                      setCurrentContent={setCurrentContent}
                    />
                    <TasksAddProjectTrigger
                      setCurrentContent={setCurrentContent}
                    />
                  </Command.Group>
                  <Command.Separator />
                  <Command.Group className="p-1">
                    <Command.Item className="flex justify-between text-destructive">
                      <div className="flex gap-2 items-center">
                        <IconTrash className="size-4" />
                        Delete
                      </div>
                    </Command.Item>
                  </Command.Group>
                </Command.List>
              </Command>
            )}
            {currentContent === 'status' && <TasksEditStatusContent />}
            {currentContent === 'project' && <TasksAddProjectContent />}
            {currentContent === 'priority' && <TasksEditPriorityContent />}
          </Popover.Content>
        </Popover>
      </CommandBar.Bar>
    </CommandBar>
  );
};
