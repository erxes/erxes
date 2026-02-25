import { Button } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { IconForms } from '@tabler/icons-react';

export const FormsBreadCrumb = () => {
  return (
    <Button variant="ghost" className="font-semibold" asChild>
      <Link to={`/frontline/forms`}>
        <IconForms />
        Forms
      </Link>
    </Button>
  );
};
