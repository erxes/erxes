import { Link, useParams } from 'react-router-dom';
import { useFormDetail } from '../hooks/useFormDetail';
import { Button } from 'erxes-ui';

export const FormDetailsBreadcrumb = () => {
  const { formId } = useParams<{ formId: string }>();
  const { formDetail } = useFormDetail({ formId: formId || '' });

  return (
    <Link
      to={`/settings/frontline/channels/${formDetail?.channelId}/forms/${formId}`}
    >
      <Button variant="ghost" className="font-semibold">
        {formDetail?.name}
      </Button>
    </Link>
  );
};
