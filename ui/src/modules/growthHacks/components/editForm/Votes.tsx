import { IUser } from 'modules/auth/types';
import { __ } from 'modules/common/utils';
import { Participators } from 'modules/inbox/components/conversationDetail';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Popover from 'react-bootstrap/Popover';
import { VotersContent, VotersCount } from '../../styles';

type Props = {
  count: number;
  users: IUser[];
};

class Votes extends React.Component<Props> {
  renderPopover() {
    return (
      <Popover id="score-popover">
        <Popover.Title as="h3">{__('Voters')}</Popover.Title>
        <Popover.Content>
          <VotersContent>
            <Participators participatedUsers={this.props.users} limit={49} />
          </VotersContent>
        </Popover.Content>
      </Popover>
    );
  }

  render() {
    const { count } = this.props;

    return (
      <OverlayTrigger
        trigger="click"
        placement="bottom-start"
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
