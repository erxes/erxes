import dayjs from 'dayjs';
import {
  ActivityDate,
  ActivityIcon,
  ActivityRow,
  FlexBody,
  FlexContent
} from 'modules/activityLogs/styles';
import { getIconAndColor } from 'modules/activityLogs/utils';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { ITask } from 'modules/tasks/types';
import React from 'react';

type Props = {
  task: ITask;
};

class Task extends React.Component<Props> {
  renderContent = () => {
    return <span>Taask detail end baainaa</span>;
  };

  render() {
    const { task } = this.props;

    const iconAndColor = getIconAndColor('task');

    return (
      <ActivityRow key={Math.random()}>
        <ActivityIcon color={iconAndColor.color}>
          <Icon icon={iconAndColor.icon} />
        </ActivityIcon>
        <React.Fragment>
          <FlexContent>
            <FlexBody>
              <strong>Task</strong>
            </FlexBody>
            <Tip text={dayjs(task.createdAt).format('llll')}>
              <ActivityDate>
                {dayjs(task.createdAt).format('MMM D, h:mm A')}
              </ActivityDate>
            </Tip>
          </FlexContent>
          {this.renderContent()}
        </React.Fragment>
      </ActivityRow>
    );
  }
}

export default Task;
