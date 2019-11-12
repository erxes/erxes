import dayjs from 'dayjs';
import {
  ActivityDate,
  ActivityIcon,
  ActivityRow,
  FlexBody,
  FlexContent
} from 'modules/activityLogs/styles';
import { IActivityLog } from 'modules/activityLogs/types';
import { getIconAndColor } from 'modules/activityLogs/utils';
import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import React from 'react';

type Props = {
  activity: IActivityLog;
};

class MergedLog extends React.Component<Props> {
  renderContent = () => {
    const { activity } = this.props;

    const { contentType, content } = activity;

    const type = contentType.includes('customer') ? 'customers' : 'companies';

    return (
      <>
        {__('Merged')}

        {content.map((id: string, index: number) => {
          return (
            <a
              style={{ display: 'inline-block', padding: '0px 3px' }}
              key={id}
              href={`/contacts/${type}/details/${id}`}
              target="__blank"
            >
              {index + 1},
            </a>
          );
        })}

        {type}
      </>
    );
  };

  render() {
    const { activity } = this.props;

    const { contentType, createdAt } = activity;

    const iconAndColor = getIconAndColor(contentType);

    return (
      <ActivityRow key={Math.random()}>
        <ActivityIcon color={iconAndColor.color}>
          <Icon icon={iconAndColor.icon} />
        </ActivityIcon>
        <React.Fragment>
          <FlexContent>
            <FlexBody>
              <strong>{contentType} activity</strong>
            </FlexBody>
            <Tip text={dayjs(createdAt).format('llll')}>
              <ActivityDate>
                {dayjs(createdAt).format('MMM D, h:mm A')}
              </ActivityDate>
            </Tip>
          </FlexContent>
          {this.renderContent()}
        </React.Fragment>
      </ActivityRow>
    );
  }
}

export default MergedLog;
