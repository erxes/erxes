import dayjs from 'dayjs';
import Tip from 'modules/common/components/Tip';
import * as React from 'react';
import { DateTime } from './styles';

type Props = {
  timestamp: Date;
};

export default class DateComponent extends React.Component<Props, {}> {
  render() {
    const { timestamp } = this.props;

    if (!timestamp) {
      return null;
    }

    let createdTime = Number(timestamp);

    if (createdTime.toString().length === 10) {
      createdTime = createdTime * 1000;
    }

    return (
      <Tip placement="bottom" text={dayjs(new Date(createdTime)).format('lll')}>
        <DateTime>{dayjs(new Date(createdTime)).fromNow()}</DateTime>
      </Tip>
    );
  }
}
