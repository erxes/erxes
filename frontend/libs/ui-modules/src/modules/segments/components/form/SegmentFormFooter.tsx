import { Button, Label, Sheet } from 'erxes-ui';
import { useSegment } from 'ui-modules/modules/segments/context/SegmentProvider';
import { useSegmentActions } from 'ui-modules/modules/segments/hooks/useSegmentActions';
import { useSegmentStats } from 'ui-modules/modules/segments/hooks/useSegmentStats';
import { useTranslation } from 'react-i18next';

export const SegmentFormFooter = ({
  callback,
}: {
  callback?: (contentId: string) => void;
}) => {
  const { form } = useSegment();
  const { stats, handleCalculateStats, loading } = useSegmentStats();
  const { handleSave } = useSegmentActions({ callback });
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });

  return (
    <>
      {!!stats && (
        <Sheet.Footer className="gap-4 sm:justify-start border-y-2 px-6 py-4">
          <div className="flex flex-col items-center">
            <Label>Total</Label>
            <h4 className="text-xl text-primary">
              {stats?.total?.toLocaleString()}
            </h4>
          </div>
          <div className="flex flex-col items-center">
            <Label>Targeted</Label>
            <h4 className="text-xl text-primary">
              {stats?.targeted?.toLocaleString()}
            </h4>
          </div>
          <div className="flex flex-col items-center">
            <Label>Percentage</Label>
            <h4 className="text-xl text-primary">{stats?.percentage}%</h4>
          </div>
        </Sheet.Footer>
      )}
      <Sheet.Footer>
        <Button
          variant="secondary"
          onClick={handleCalculateStats}
          disabled={loading}
        >
          {loading ? 'Calculating...' : t('calculate-segment-reach')}
        </Button>
        <Button onClick={form.handleSubmit(handleSave)}>
          {t('save-segment')}
        </Button>
      </Sheet.Footer>
    </>
  );
};
