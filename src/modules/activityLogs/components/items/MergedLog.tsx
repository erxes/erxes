import dayjs from 'dayjs';
import {
  ActivityDate,
  FlexBody,
  FlexContent
} from 'modules/activityLogs/styles';
import { IActivityLog } from 'modules/activityLogs/types';
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

    return (
      <>
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
      </>
    );
  }
}

export default MergedLog;
