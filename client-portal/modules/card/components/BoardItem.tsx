import {
  Content,
  ItemDate,
  ItemFooter,
  ItemWrapper,
  Right,
  Wrapper
} from '../../styles/tasks';

import EmptyState from '../../common/form/EmptyState';
import PriorityIndicator from '../../common/PriorityIndicator';
import React from 'react';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { ColumnContentBody } from '../../styles/cards';
import DueDateLabel from '../../common/DueDateLabel';

type Props = {
  items: any;
  type: string;
  stageId: string;
  viewType: string;
};

function BoardItem({ items, viewType, type, stageId }: Props) {
  const router = useRouter();
  const activeStageId = (router.query as any).stageId || stageId;

  const renderDate = date => {
    if (!date) {
      return null;
    }

    return <ItemDate>{dayjs(date).format('MMM D, YYYY')}</ItemDate>;
  };

  if (!items || items.length === 0) {
    return (
      <EmptyState
        icon="ban"
        text="There is no cards in this stage"
        size="small"
      />
    );
  }

  if (viewType === 'calendar') {
    return (
      <ColumnContentBody>
        {items.map(item => (
          <ItemWrapper
            key={item._id}
            onClick={() =>
              router.push(
                `/${type}s?stageId=${activeStageId}&itemId=${item._id}`
              )
            }
          >
            <Content>
              <h5>
                {item.priority && <PriorityIndicator value={item.priority} />}{' '}
                {item.name}
              </h5>
              <p>{item.description}</p>
              {item && (
                <DueDateLabel
                  startDate={item.startDate}
                  closeDate={item.closeDate}
                  isComplete={item.isComplete}
                />
              )}
            </Content>
            <ItemFooter>
              Last updated:
              <Right>{renderDate(item.modifiedAt)}</Right>
            </ItemFooter>
          </ItemWrapper>
        ))}
      </ColumnContentBody>
    );
  }
  return (
    <Wrapper>
      {items.map(task => (
        <ItemWrapper
          key={task._id}
          onClick={() =>
            router.push(`/${type}s?stageId=${activeStageId}&itemId=${task._id}`)
          }
        >
          <Content>
            <h5>
              {task.priority && <PriorityIndicator value={task.priority} />}{' '}
              {task.name}
            </h5>
            <p>{task.description}</p>
          </Content>
          <ItemFooter>
            Last updated:
            <Right>{renderDate(task.modifiedAt)}</Right>
          </ItemFooter>
        </ItemWrapper>
      ))}
    </Wrapper>
  );
}

export default BoardItem;
