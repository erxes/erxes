import dayjs from 'dayjs';
import Tip from 'modules/common/components/Tip';
import * as React from 'react';
import { DateTime } from './styles';

type Props = {
  timestamp: Date;
  type: string;
};

export default class DateComponent extends React.Component<Props, {}> {
  render() {
    const { timestamp, type } = this.props;

    if (!timestamp) {
      return null;
    }

    const createdTime =
      type === 'post' ? new Date(timestamp).getTime() * 1000 : timestamp;

    return (
      <Tip placement="bottom" text={dayjs(new Date(createdTime)).format('lll')}>
        <DateTime>{dayjs(new Date(createdTime)).fromNow()}</DateTime>
      </Tip>
    );
  }
}
