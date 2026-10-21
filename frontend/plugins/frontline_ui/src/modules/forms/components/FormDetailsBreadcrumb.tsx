import { Link, useParams } from 'react-router-dom';
import { useFormDetail } from '../hooks/useFormDetail';
import { Button } from 'erxes-ui';

export const FormDetailsBreadcrumb = () => {
  const { formId } = useParams<{ formId: string }>();
  const { formDetail } = useFormDetail({ formId: formId || '' });

  return (
    <Link
      to={`/frontline/settings/channels/${formDetail?.channelId}/forms/${formId}`}
    >
      <Button variant="ghost">{formDetail?.name}</Button>
    </Link>
  );
};
