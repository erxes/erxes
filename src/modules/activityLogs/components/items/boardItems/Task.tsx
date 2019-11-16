import dayjs from 'dayjs';
import {
  ActivityDate,
  FlexBody,
  FlexContent
} from 'modules/activityLogs/styles';
import { IItem } from 'modules/boards/types';
import Tip from 'modules/common/components/Tip';
import React from 'react';

type Props = {
  task: IItem;
};

class Task extends React.Component<Props> {
  renderContent = () => {
    return <span>Taask detail end baainaa</span>;
  };

  render() {
    const { task } = this.props;

    return (
      <>
        <FlexContent>
          <FlexBody>
            <strong>Somebody created task</strong>
          </FlexBody>
          <Tip text={dayjs(task.createdAt).format('llll')}>
            <ActivityDate>
              {dayjs(task.createdAt).format('MMM D, h:mm A')}
            </ActivityDate>
          </Tip>
        </FlexContent>
        {this.renderContent()}
      </>
    );
  }
}

export default Task;
