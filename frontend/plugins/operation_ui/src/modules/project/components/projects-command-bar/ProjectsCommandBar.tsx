import { IconRepeat } from '@tabler/icons-react';
import { useParams } from 'react-router';
import {
  Button,
  Command,
  CommandBar,
  Popover,
  RecordTable,
  Separator,
} from 'erxes-ui';
import { useState } from 'react';
import {
  ProjectsChangeLeadContent,
  ProjectsChangeLeadTrigger,
} from './ProjectsChangeLead';
import {
  ProjectsChangeStatusContent,
  ProjectsChangeStatusTrigger,
} from './ProjectsChangeStatus';
import {
  ProjectsChangePriorityContent,
  ProjectsChangePriorityTrigger,
} from './ProjectsChangePriority';
import {
  ProjectsSetTargetDateContent,
  ProjectsSetTargetDateTrigger,
} from './ProjectsSetTargetDate';
import { ProjectsDeleteContent, ProjectsDeleteTrigger } from './ProjectsRemove';

export const ProjectsCommandBar = () => {
  const [open, setOpen] = useState(false);
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const [currentContent, setCurrentContent] = useState<string>('main');
  const { teamId } = useParams<{ teamId: string }>();
  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value>{selectedRows.length} selected</CommandBar.Value>
        <Separator.Inline />

        <Popover
          open={open}
          onOpenChange={() => {
            setOpen(!open);
            setCurrentContent('main');
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
            sideOffset={10}
          >
            {currentContent === 'main' && (
              <Command>
                <Command.Input></Command.Input>
                <Command.List>
                  <Command.Group className="p-1">
                    {teamId && (
                      <ProjectsChangeLeadTrigger
                        setCurrentContent={setCurrentContent}
                      />
                    )}
                    <ProjectsChangeStatusTrigger
                      setCurrentContent={setCurrentContent}
                    />
                    <ProjectsChangePriorityTrigger
                      setCurrentContent={setCurrentContent}
                    />
                    <ProjectsSetTargetDateTrigger
                      setCurrentContent={setCurrentContent}
                    />
                  </Command.Group>
                  <Command.Separator />
                  <Command.Group className="p-1">
                    <ProjectsDeleteTrigger
                      setCurrentContent={setCurrentContent}
                    />
                  </Command.Group>
                </Command.List>
              </Command>
            )}
            {currentContent === 'lead' && (
              <ProjectsChangeLeadContent
                projectIds={selectedRows.map((row) => row.original._id)}
                teamId={teamId}
                setOpen={setOpen}
              />
            )}
            {currentContent === 'status' && (
              <ProjectsChangeStatusContent
                projectIds={selectedRows.map((row) => row.original._id)}
                setOpen={setOpen}
              />
            )}
            {currentContent === 'priority' && (
              <ProjectsChangePriorityContent
                projectIds={selectedRows.map((row) => row.original._id)}
                setOpen={setOpen}
              />
            )}
            {currentContent === 'targetDate' && (
              <ProjectsSetTargetDateContent
                projectIds={selectedRows.map((row) => row.original._id)}
                setOpen={setOpen}
              />
            )}
            {currentContent === 'delete' && (
              <ProjectsDeleteContent
                projectIds={selectedRows.map((row) => row.original._id)}
                setOpen={setOpen}
              />
            )}
          </Popover.Content>
        </Popover>
      </CommandBar.Bar>
    </CommandBar>
  );
};
