import { IUser } from 'modules/auth/types';
import { Participators } from 'modules/inbox/components/conversationDetail';
import React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { VotersContent, VotersCount, VotersHeader } from '../../styles';

type Props = {
  count: number;
  users: IUser[];
};

class Votes extends React.Component<Props> {
  renderPopover() {
    return (
      <Popover id="score-popover">
        <VotersHeader>Voters</VotersHeader>
        <VotersContent>
          <Participators participatedUsers={this.props.users} limit={49} />
        </VotersContent>
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
        <VotersCount>
          {count} vote{count > 1 && 's'}
        </VotersCount>
      </OverlayTrigger>
    );
  }
}

export default Votes;
