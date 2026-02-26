import { Button } from 'erxes-ui';
import { IconPlus } from '@tabler/icons-react';
import { FC } from 'react';
import { Link } from 'react-router-dom';

const FormsCreateButton: FC<React.ComponentProps<typeof Button>> = (props) => {
  return (
    <Button asChild {...props}>
      <Link to={`/frontline/forms/create`}>
        <IconPlus />
        Create form
      </Link>
    </Button>
  );
};
export { FormsCreateButton };
