import dayjs from 'dayjs';
import Tip from 'modules/common/components/Tip';
import * as React from 'react';
import { DateTime } from './styles';

type Props = {
  timestamp: Date;
  type: string;
  permalink_url: string;
};

export default class DateComponent extends React.Component<Props, {}> {
  render() {
    const { timestamp, type, permalink_url } = this.props;

    if (!timestamp) {
      return null;
    }

    const createdTime =
      type === 'post' ? new Date(timestamp).getTime() * 1000 : timestamp;

    return (
      <Tip placement="bottom" text={dayjs(new Date(createdTime)).format('lll')}>
        <DateTime href={permalink_url}>
          {dayjs(new Date(createdTime)).fromNow()}
        </DateTime>
      </Tip>
    );
  }
}
