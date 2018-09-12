import { Button, Icon, ModalTrigger, Tip } from 'modules/common/components';
import { ActionButtons, SidebarListItem } from 'modules/settings/styles';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { ChannelForm } from '../containers';
import { MemberImg, Members, More } from '../styles';
import { IChannel, IUsers } from "../types";

type Props = {
  channel: IChannel,
  members: IUsers[],
  remove: (id: string) => void,
  save: ({ doc }: { doc: any; }, callback: () => void, channel: IChannel) => void,
  isActive: boolean
};

class ChannelRow extends Component<Props, {}> {
  static contextTypes =  {
    __: PropTypes.func
  }

  constructor(props: Props) {
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
        <Link to={`?_id=${channel._id}`}>
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

export default ChannelRow;
