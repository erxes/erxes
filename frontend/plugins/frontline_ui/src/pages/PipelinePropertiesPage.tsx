import { PipelinePropertySelector } from '@/pipelines/components/PipelinePropertySelector';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { useUpdatePipeline } from '@/pipelines/hooks/useUpdatePipeline';
import { Button, InfoCard, Spinner } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

export const PipelinePropertiesPage = () => {
  const { t } = useTranslation(['frontline', 'common']);
  const { pipelineId } = useParams<{ pipelineId: string }>();
  const { pipeline, loading } = useGetPipeline(pipelineId);
  const { updatePipeline, loading: updating } = useUpdatePipeline();
  const [propertyIds, setPropertyIds] = useState<string[]>([]);

  useEffect(() => {
    setPropertyIds(pipeline?.propertyIds || []);
  }, [pipeline?.propertyIds]);

  return (
    <div className="flex flex-col gap-5">
      <InfoCard
        title={t('common:properties')}
        description={t('select-ticket-property-fields-description')}
      >
        <InfoCard.Content>
          {loading ? (
            <Spinner containerClassName="py-8" />
          ) : (
            <PipelinePropertySelector
              value={propertyIds}
              onChange={setPropertyIds}
            />
          )}
        </InfoCard.Content>
      </InfoCard>
      <div className="flex justify-end border-t pt-5">
        <Button
          disabled={!pipeline || updating}
          onClick={() =>
            updatePipeline({
              variables: {
                _id: pipelineId,
                name: pipeline?.name,
                propertyIds,
              },
            })
          }
        >
          {updating ? <Spinner /> : t('update')}
        </Button>
      </div>
    </div>
  );
};
