import { IUser } from 'modules/auth/types';
import { Participators } from 'modules/inbox/components/conversationDetail';
import React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

type Props = {
  count: number;
  users: IUser[];
};

class Votes extends React.Component<Props> {
  renderPopover() {
    return (
      <Popover id="score-popover">
        <Participators participatedUsers={this.props.users} />
      </Popover>
    );
  }

  render() {
    const { count } = this.props;

    return (
      <OverlayTrigger
        trigger="click"
        placement="bottom"
        rootClose={true}
        overlay={this.renderPopover()}
      >
        <a href="javascript:void(0)">
          {count} vote{count > 1 && 's'}
        </a>
      </OverlayTrigger>
    );
  }
}

export default Votes;
