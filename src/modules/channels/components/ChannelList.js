import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ChannelForm } from '../containers';
import { ModalTrigger, Tip, Button, Icon } from 'modules/common/components';
import {
  SidebarListli,
  ManageActions,
  Members,
  MemberImg,
  More,
  Row,
  RowContent,
  ActionButtons
} from '../styles';

const propTypes = {
  channel: PropTypes.object.isRequired,
  members: PropTypes.array.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired
};

class ChannelList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isMembervisible: true
    };
    this.renderEditForm = this.renderEditForm.bind(this);
    this.renderMember = this.renderMember.bind(this);
    this.toggleMember = this.toggleMember.bind(this);
    this.remove = this.remove.bind(this);
    this.renderRemoveAction = this.renderRemoveAction.bind(this);
    this.renderEditAction = this.renderEditAction.bind(this);
  }

  remove() {
    this.props.remove(this.props.channel._id);
  }

  renderRemoveAction() {
    return (
      <Tip text="Delete">
        <Button btnStyle="link" onClick={this.remove}>
          <Icon icon="close" />
        </Button>
      </Tip>
    );
  }

  renderEditAction() {
    const { channel, save } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text="Edit">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger size={this.size} title="Edit" trigger={editTrigger}>
        {this.renderEditForm({ channel, save })}
      </ModalTrigger>
    );
  }

  renderEditForm(props) {
    return <ChannelForm {...props} />;
  }

  toggleMember() {
    this.setState({ isMembervisible: !this.state.isMembervisible });
  }

  renderMember(member) {
    return (
      <Tip key={member._id} text={member.details.fullName} placement="top">
        <MemberImg
          key={member._id}
          src={(member.details && member.details.avatar) || []}
        />
      </Tip>
    );
  }

  render() {
    const { channel, members } = this.props;
    const limit = 8;
    const { isMembervisible } = this.state;
    let selectedMembers = [];

    if (channel) {
      selectedMembers = members.filter(u => channel.memberIds.includes(u._id));
    }
    const length = selectedMembers.length;

    const Tooltip = (
      <Tip placement="top" text="View more">
        <More>{`+${length - limit}`}</More>
      </Tip>
    );

    return (
      <SidebarListli key={channel._id}>
        <Row>
          <RowContent>
            <Link to={`?id=${channel._id}`}>{channel.name}</Link>
            <Members onClick={this.toggleMember}>
              {selectedMembers
                .slice(0, limit && isMembervisible ? limit : length)
                .map(member => this.renderMember(member))}
              {limit && isMembervisible && length - limit > 0 && Tooltip}
            </Members>
          </RowContent>
          <ManageActions>
            <ActionButtons>
              {this.renderEditAction()}
              {this.renderRemoveAction()}
            </ActionButtons>
          </ManageActions>
        </Row>
      </SidebarListli>
    );
  }
}

ChannelList.propTypes = propTypes;

export default ChannelList;
