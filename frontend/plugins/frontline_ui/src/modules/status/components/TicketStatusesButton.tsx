import { IconChevronRight } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const TicketStatusesButton = () => {
  const { t } = useTranslation('frontline');
  const { id } = useParams<{
    id: string;
  }>();
  const { pipelineId } = useParams<{
    pipelineId: string;
  }>();
  const navigate = useNavigate();
  return (
    <section className="w-full">
      <div
        className="w-full shrink-0 border border-muted-foreground/15 rounded-md hover:bg-sidebar/50 cursor-pointer p-4"
        onClick={() =>
          navigate(
            `/settings/frontline/channels/${id}/pipelines/${pipelineId}/statuses`,
          )
        }
      >
        <div className="flex items-center justify-between">
          <p>{t('manage-ticket-statuses')}</p>

          <div className="flex items-center gap-2">
            <IconChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </section>
  );
};
