import { useVolumeSeries } from '../../hooks/useVolumeSeries';
import { useCarrierBreakdown } from '../../hooks/useCarrierBreakdown';
import { useHeatmap } from '../../hooks/useHeatmap';
import { VolumeChart } from './VolumeChart';
import { CarrierDonut } from './CarrierDonut';
import { HeatmapChart } from './HeatmapChart';
import { SectionCard } from '../SectionCard';
import { useTranslation } from 'react-i18next';

/** Overview tab: volume series + carrier donut + heatmap. */
export function OverviewSection() {
  const { t } = useTranslation('frontline');
  const { series, loading: volumeLoading } = useVolumeSeries();
  const { breakdown, loading: carrierLoading } = useCarrierBreakdown();
  const { cells, loading: heatLoading } = useHeatmap();

  return (
    <div className="flex flex-col gap-5">
      {/* Volume + Carrier row */}
      <div className="grid gap-4 lg:grid-cols-3">
        <SectionCard
          className="lg:col-span-2"
          title={t('call-volume-over-time')}
          description={t('daily-inbound-outbound-breakdown')}
          loading={volumeLoading}
          skeletonHeight="h-64"
        >
          <VolumeChart data={series} />
        </SectionCard>

        <SectionCard
          title={t('carrier-breakdown')}
          description={t('by-mongolian-phone-prefix')}
          loading={carrierLoading}
          skeletonHeight="h-40"
        >
          <CarrierDonut data={breakdown} />
        </SectionCard>
      </div>

      {/* Heatmap */}
      <SectionCard
        title={t('hour-day-heatmap')}
        description={t('call-volume-by-hour-and-day')}
        loading={heatLoading}
        skeletonHeight="h-48"
      >
        <HeatmapChart cells={cells} />
      </SectionCard>
    </div>
  );
}
