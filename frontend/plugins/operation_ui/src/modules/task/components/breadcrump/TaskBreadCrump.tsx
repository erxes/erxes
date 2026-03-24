import { Breadcrumb, Button, ToggleGroup } from 'erxes-ui';
import { IconCheckbox } from '@tabler/icons-react';
import { Link, useLocation } from 'react-router-dom';
import { useParams } from 'react-router-dom';

export const TaskBreadCrump = ({ link }: { link: string }) => {
  const { pathname } = useLocation();
  const { teamId } = useParams();

  if (!teamId) {
    return (
      <>
        <Breadcrumb.Item>
          <Button variant="ghost" asChild>
            <Link to={link}>
              <IconCheckbox />
              Tasks
            </Link>
          </Button>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <ToggleGroup type="single" value={pathname}>
          <ToggleGroup.Item value="/operation/tasks" asChild>
            <Link to="/operation/tasks">Assigned</Link>
          </ToggleGroup.Item>
          <ToggleGroup.Item value="/operation/tasks/created" asChild>
            <Link to="/operation/tasks/created">Created</Link>
          </ToggleGroup.Item>
        </ToggleGroup>
      </>
    );
  }

  return (
    <Breadcrumb.Item>
      <Button variant="ghost" asChild>
        <Link to={link}>
          <IconCheckbox />
          Tasks
        </Link>
      </Button>
    </Breadcrumb.Item>
  );
};
