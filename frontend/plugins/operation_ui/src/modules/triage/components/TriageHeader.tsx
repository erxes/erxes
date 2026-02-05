import { IconCaretLeftRight } from '@tabler/icons-react';
import { Button, Separator, Sidebar } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { AddTriageSheet } from './add-triage/AddTriageSheet';

export const TriageHeader = () => {
  const { teamId } = useParams();

  return (
    <>
      <div className="flex flex-col h-13 shrink-0 bg-sidebar w-full">
        <div className="flex gap-2 px-3 flex-auto items-center">
          <Sidebar.Trigger /> <Separator.Inline />
          <Button variant="ghost" asChild>
            <Link to={`/operation/team/${teamId}/triage`}>
              <IconCaretLeftRight />
              Triage
            </Link>
          </Button>
          <div className="ml-auto">
            <AddTriageSheet />
          </div>
        </div>
      </div>
      <Separator className="w-auto flex-none" />
    </>
  );
};
