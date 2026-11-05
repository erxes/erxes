import { useState } from 'react';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TourismPanelRecordState } from '@/tms/side-panel/TourismPanelLayout';
import { TourismPanelOverview } from '@/tms/side-panel/TourismPanelOverview';
import { TourismPanelRemoveAction } from '@/tms/side-panel/TourismPanelRemoveAction';
import {
  ITourismPanelViewProps,
  ITourismPanelViews,
} from '@/tms/side-panel/tourismPanelTypes';
import { useTourismPanelBranch } from '@/tms/side-panel/useTourismPanel';
import { useItineraryDetail } from '../hooks/useItineraryDetail';
import { useRemoveItineraries } from '../hooks/useRemoveItineraries';
import { ItineraryEditSheet } from './ItineraryEditSheet';

const formatNumber = (value?: number) =>
  typeof value === 'number' ? value.toLocaleString() : undefined;

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleString() : undefined;

const ItineraryPanelDetail = ({ contentId }: ITourismPanelViewProps) => {
  const { t } = useTranslation('tourism');
  const [editOpen, setEditOpen] = useState(false);
  const { branchId, branchLanguages, mainLanguage } = useTourismPanelBranch();
  const { itinerary, loading, refetch } = useItineraryDetail(
    contentId,
    true,
    mainLanguage,
  );

  if (!itinerary) {
    return <TourismPanelRecordState loading={loading} hasRecord={false} />;
  }

  const handleEditOpenChange = (open: boolean) => {
    setEditOpen(open);

    if (!open) {
      refetch();
    }
  };

  const groupDays = [...(itinerary.groupDays || [])].sort(
    (a, b) => (a.day ?? 0) - (b.day ?? 0),
  );

  return (
    <>
      <TourismPanelOverview
        title={itinerary.name || t('itinerary')}
        thumbnailUrl={itinerary.images?.[0]}
        editLabel={t('edit')}
        onEdit={() => setEditOpen(true)}
        fields={[
          {
            label: t('color'),
            value: itinerary.color && (
              <div
                className="size-4 rounded-full border border-border"
                style={{ backgroundColor: itinerary.color }}
              />
            ),
          },
          {
            label: t('duration-days'),
            value: formatNumber(itinerary.duration),
          },
          {
            label: t('total-cost'),
            value: formatNumber(itinerary.totalCost),
          },
          {
            label: t('guides-daily-wage'),
            value: formatNumber(itinerary.guideCost),
          },
          {
            label: t('drivers-daily-wage'),
            value: formatNumber(itinerary.driverCost),
          },
          {
            label: t('daily-cost-of-food'),
            value: formatNumber(itinerary.foodCost),
          },
          {
            label: t('gasoline-fee-per-car'),
            value: formatNumber(itinerary.gasCost),
          },
          {
            label: t('total-price-additive-assistant'),
            value: formatNumber(itinerary.guideCostExtra),
          },
          { label: t('created'), value: formatDate(itinerary.createdAt) },
          { label: t('modified'), value: formatDate(itinerary.modifiedAt) },
        ]}
      >
        {groupDays.length > 0 && (
          <ol className="flex flex-col gap-1 px-2 text-xs">
            {groupDays.map((groupDay, index) => (
              <li
                key={groupDay.day ?? index}
                className="flex gap-2 rounded-sm bg-muted px-2 py-1.5"
              >
                <span className="font-medium text-muted-foreground">
                  {groupDay.day ?? index + 1}.
                </span>
                <span className="min-w-0 break-words">
                  {groupDay.title || '-'}
                </span>
              </li>
            ))}
          </ol>
        )}
      </TourismPanelOverview>
      <ItineraryEditSheet
        itineraryId={itinerary._id}
        branchId={itinerary.branchId || branchId}
        branchLanguages={branchLanguages}
        mainLanguage={mainLanguage}
        open={editOpen}
        onOpenChange={handleEditOpenChange}
      />
    </>
  );
};

const ItineraryPanelActions = ({ contentId }: ITourismPanelViewProps) => {
  const { t } = useTranslation('tourism');
  const { removeItineraries, loading } = useRemoveItineraries();

  return (
    <TourismPanelRemoveAction
      message={t('confirm-delete-itinerary')}
      loading={loading}
      onRemove={(onCompleted) =>
        removeItineraries([contentId])
          .then(() => {
            toast({
              title: t('success'),
              variant: 'success',
              description: t('itinerary-deleted-successfully'),
            });
            onCompleted();
          })
          .catch((error: Error) =>
            toast({
              title: t('error'),
              description: error.message || t('failed-to-delete-itinerary'),
              variant: 'destructive',
            }),
          )
      }
    />
  );
};

export const ITINERARY_PANEL: ITourismPanelViews = {
  addLabel: 'create-itinerary',
  editLabel: 'itinerary',
  Detail: ItineraryPanelDetail,
  Actions: ItineraryPanelActions,
};
