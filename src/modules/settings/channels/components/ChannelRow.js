import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ChannelForm } from '../containers';
import { ModalTrigger, Tip, Button, Icon } from 'modules/common/components';
import { SidebarListItem, ActionButtons } from 'modules/settings/styles';
import { Members, MemberImg, More } from '../styles';

const propTypes = {
  channel: PropTypes.object.isRequired,
  members: PropTypes.array.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  isActive: PropTypes.bool
};

class ChannelRow extends Component {
  constructor(props) {
    super(props);

    this.renderEditForm = this.renderEditForm.bind(this);
    this.renderMember = this.renderMember.bind(this);
    this.remove = this.remove.bind(this);
    this.renderEditAction = this.renderEditAction.bind(this);
  }

  remove() {
    const { remove, channel } = this.props;
    remove(channel._id);
  }

  renderEditAction() {
    const { channel, save, members } = this.props;
    const { __ } = this.context;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')}>
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger size={this.size} title="Edit" trigger={editTrigger}>
        {this.renderEditForm({ channel, save, members })}
      </ModalTrigger>
    );
  }

  renderEditForm(props) {
    return <ChannelForm {...props} />;
  }

  renderMember(member) {
    return (
      <Tip key={member._id} text={member.details.fullName} placement="top">
        <MemberImg
          key={member._id}
          src={
            (member.details && member.details.avatar) ||
            '/images/avatar-colored.svg'
          }
        />
      </Tip>
    );
  }

  renderMembers() {
    const { channel, members } = this.props;

    let selectedMembers = [];

    if (channel) {
      selectedMembers = members.filter(u => channel.memberIds.includes(u._id));
    }

    const length = selectedMembers.length;
    const limit = 8;

    // render members ================
    const limitedMembers = selectedMembers.slice(0, limit);
    const renderedMembers = limitedMembers.map(member =>
      this.renderMember(member)
    );

    // render readmore ===============
    let readMore = null;

    if (length - limit > 0) {
      readMore = <More key="readmore">{`+${length - limit}`}</More>;
    }

    return [renderedMembers, readMore];
  }

  render() {
    const { channel, isActive } = this.props;

    return (
      <SidebarListItem key={channel._id} isActive={isActive}>
        <Link to={`?id=${channel._id}`}>
          {channel.name}
          <Members>{this.renderMembers()}</Members>
        </Link>
        <ActionButtons>
          {this.renderEditAction()}
          <Tip text="Delete">
            <Button btnStyle="link" onClick={this.remove} icon="cancel-1" />
          </Tip>
        </ActionButtons>
      </SidebarListItem>
    );
  }
}

ChannelRow.propTypes = propTypes;
ChannelRow.contextTypes = {
  __: PropTypes.func
};

export default ChannelRow;
