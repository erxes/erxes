import { BroadcastEditSheet } from '@/broadcast/components/BroadcastEditSheet';
import { BroadcastDetailSheet } from '@/broadcast/components/detail/BroadcastDetailSheet';
import { BroadcastFilter } from '@/broadcast/components/list/BroadcastFilter';
import { BroadcastHeader } from '@/broadcast/components/list/BroadcastHeader';
import { BroadcastCalendar } from '@/broadcast/components/calendar/BroadcastCalendar';
import { BroadcastCardList } from '@/broadcast/components/list/BroadcastCardList';
import { BroadcastRecordTable } from '@/broadcast/components/list/BroadcastRecordTable';
import { useBroadcastListLayout } from '@/broadcast/hooks/useBroadcastListLayout';
import { BroadcastStatistic } from '@/broadcast/components/detail/BroadcastStatistic';
import { useBroadcastLiveSync } from '@/broadcast/hooks/useBroadcastChanged';
import { PageContainer, PageSubHeader } from 'erxes-ui';

const LAYOUTS = {
  list: BroadcastRecordTable,
  grid: BroadcastCardList,
  calendar: BroadcastCalendar,
};

const BroadcastIndexPage = () => {
  const { layout } = useBroadcastListLayout();
  const Layout = LAYOUTS[layout] ?? BroadcastRecordTable;

  useBroadcastLiveSync();

  return (
    <PageContainer>
      <BroadcastHeader />
      <PageSubHeader>
        <BroadcastFilter />
      </PageSubHeader>

      <div className="flex overflow-hidden w-full h-full">
        <Layout />
        <BroadcastStatistic />
      </div>

      <BroadcastDetailSheet />
      <BroadcastEditSheet />
    </PageContainer>
  );
};

export default BroadcastIndexPage;
