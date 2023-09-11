import React from 'react';
import { Config, IStage, IUser } from '../../types';
import Detail from '../../card/containers/Detail';
import Group from '../containers/Group';
import { useRouter } from 'next/router';
import { __ } from '../../../utils';
import { getFullTitle, monthColumns } from '../../utils/calendar';
import { Dayjs } from 'dayjs';
import { Content, ContentHeader, ScrolledContent } from '../../styles/cards';
import { IDateColumn } from '../../types';

type Props = {
  stages: IStage[];
  config: Config;
  stageId: string;
  type: string;
  groupType: string;
  viewType: string;
  currentUser: IUser;
  currentDate: Dayjs;
};

function CalendarView({
  stages,
  config,
  stageId,
  viewType,
  type,
  groupType,
  currentUser,
  currentDate
}: Props) {
  const router = useRouter();
  const { itemId } = router.query as any;

  if (!stages || stages.length === 0) {
    return null;
  }

  if (itemId) {
    return (
      <Detail
        _id={itemId}
        onClose={() => router.push(`/${type}`)}
        currentUser={currentUser}
        config={config}
        type={type}
      />
    );
  }

  const renderColumn = (index: number, date: IDateColumn) => {
    return (
      <Content key={index}>
        <ContentHeader>{getFullTitle(date)}</ContentHeader>
        <Group
          groupType={groupType}
          viewType={viewType}
          type={type}
          id={stageId}
          date={date}
        />
      </Content>
    );
  };

  const renderContent = () => {
    const months = monthColumns(currentDate, 3);

    return months.map((date: IDateColumn, index: number) =>
      renderColumn(index, date)
    );
  };

  return <ScrolledContent>{renderContent()}</ScrolledContent>;
}

export default CalendarView;
