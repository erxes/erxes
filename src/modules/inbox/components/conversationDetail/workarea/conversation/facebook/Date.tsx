import { Tip } from 'modules/common/components';
import { IMessage } from 'modules/inbox/types';
import * as moment from 'moment';
import * as React from 'react';
import { DateTime } from './styles';

type Props = {
  message: IMessage;
};

export default class DateComponent extends React.Component<Props, {}> {
  render() {
    const { message } = this.props;
    const { facebookData } = message;

    if (!facebookData) {
      return null;
    }

    let createdTime = Number(facebookData.createdTime);

    if (createdTime.toString().length === 10) {
      createdTime = createdTime * 1000;
    }

    return (
      <Tip
        placement="bottom"
        text={moment(new Date(createdTime)).format('lll')}
      >
        <DateTime>{moment(new Date(createdTime)).fromNow()}</DateTime>
      </Tip>
    );
  }
}
