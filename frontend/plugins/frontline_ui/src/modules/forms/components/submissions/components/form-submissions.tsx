import { useParams } from 'react-router';
import { useGetFormSubmissions } from '../hooks/useGetFormSubmissions';
import { Button, Empty, Spinner, toast } from 'erxes-ui';
import { SubmissionsTable } from './submissions-table';
import { IconCheck, IconLink, IconListDetails } from '@tabler/icons-react';
import { useFormDetail } from '@/forms/hooks/useFormDetail';
import { REACT_APP_WIDGETS_URL } from '@/utils';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const CopyLink = ({
  channelId,
  formId,
  label,
}: {
  channelId: string;
  formId: string;
  label: string;
}) => {
  const { t } = useTranslation('frontline');
  const [copied, setCopied] = useState(false);
  const link = `${REACT_APP_WIDGETS_URL}/live/${channelId}/${formId}`;

  const handleCopy = () => {
    navigator.clipboard
      .writeText(link)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(() => {
        toast({
          title: t('failed-to-copy', { label: label.toLowerCase() }),
          description: t('please-try-again'),
          variant: 'destructive',
        });
      });
  };
  return (
    <Button variant={'outline'} onClick={handleCopy}>
      {copied ? (
        <>
          <IconCheck className="w-4 h-4 mr-2" />
          {t('copied')}
        </>
      ) : (
        <>
          <IconLink />
          {label}
        </>
      )}
    </Button>
  );
};

export const FormSubmissions = () => {
  const { t } = useTranslation('frontline');
  const { formId } = useParams<{ formId: string }>();
  const { submissions, loading, pageInfo, handleFetchMore } =
    useGetFormSubmissions({
      variables: {
        formId,
      },
      skip: !formId,
    });

  const { formDetail } = useFormDetail({ formId: formId || '' });

  if (loading) {
    return <Spinner className="py-32" />;
  }
  if (submissions?.length === 0) {
    return (
      <Empty className="bg-sidebar rounded-lg m-3">
        <Empty.Header>
          <Empty.Media>
            <IconListDetails />
          </Empty.Media>
          <Empty.Title>{t('no-submissions-found')}</Empty.Title>
          <Empty.Description>
            {t('share-link-description')}
          </Empty.Description>
        </Empty.Header>
        <Empty.Content>
          <CopyLink
            channelId={formDetail?.channelId || ''}
            formId={formId || ''}
            label={formDetail?.name || 'Form'}
          />
        </Empty.Content>
      </Empty>
    );
  }
  return (
    <SubmissionsTable
      submissions={submissions}
      loading={loading}
      hasPreviousPage={pageInfo?.hasPreviousPage}
      hasNextPage={pageInfo?.hasNextPage}
      handleFetchMore={handleFetchMore}
    />
  );
};
