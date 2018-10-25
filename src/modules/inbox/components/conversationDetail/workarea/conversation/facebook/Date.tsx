import { Tip } from 'modules/common/components';
import { IMessage } from 'modules/inbox/types';
import * as moment from 'moment';
import * as React from 'react';
import { DateTime } from './styles';

type Props = {
  message: IMessage;
};

export default class Date extends React.Component<Props, {}> {
  render() {
    const { message } = this.props;

    return (
      <Tip placement="bottom" text={moment(message.createdAt).format('lll')}>
        <DateTime>{moment(message.createdAt).fromNow()}</DateTime>
      </Tip>
    );
  }
}
