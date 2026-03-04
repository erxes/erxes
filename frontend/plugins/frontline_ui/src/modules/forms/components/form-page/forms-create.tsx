import { Button } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { FC } from 'react';
import { Link, useParams } from 'react-router-dom';

const FormsCreateButton: FC<React.ComponentProps<typeof Button>> = (props) => {
  const { id: channelId } = useParams<{ id: string }>();
  return (
    <Button asChild {...props}>
      <Link to={`/settings/frontline/channels/${channelId}/forms/create`}>
        <IconPlus />
        Create form
      </Link>
    </Button>
  );
};
export { FormsCreateButton };
