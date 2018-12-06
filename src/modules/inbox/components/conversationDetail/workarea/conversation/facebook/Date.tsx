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
    const { facebookData } = message;

    if (!facebookData) {
      return null;
    }

    return (
      <Tip
        placement="bottom"
        text={moment(facebookData.createdTime).format('lll')}
      >
        <DateTime>{moment(facebookData.createdTime).fromNow()}</DateTime>
      </Tip>
    );
  }
}
