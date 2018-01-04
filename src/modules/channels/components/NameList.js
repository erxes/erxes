import React from 'react';
import { Link } from 'react-router-dom';
import { Action as CommonAction } from '../common/';
import { ChannelForm } from '../containers';
import { Tip } from 'modules/common/components';
import { SidebarListli, Members, MemberImg, More } from '../styles';

class NameList extends CommonAction {
  constructor(props) {
    super(props);

    this.state = {
      isMembervisible: true
    };
    this.renderEditForm = this.renderEditForm.bind(this);
    this.renderMember = this.renderMember.bind(this);
    this.toggleMember = this.toggleMember.bind(this);
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
    const { object, members } = this.props;
    const limit = 10;
    const { isMembervisible } = this.state;
    let selectedMembers = [];

    if (object) {
      selectedMembers = members.filter(u => object.memberIds.includes(u._id));
    }
    const length = selectedMembers.length;

    const Tooltip = (
      <Tip placement="top" text="View more">
        <More>{`+${length - limit}`}</More>
      </Tip>
    );

    return (
      <SidebarListli key={object._id}>
        <Link to={`?id=${object._id}`}>{object.name}</Link>
        <Members onClick={this.toggleMember}>
          {selectedMembers
            .slice(0, limit && isMembervisible ? limit : length)
            .map(member => this.renderMember(member))}
          {limit && isMembervisible && length - limit > 0 && Tooltip}
        </Members>
        {this.renderActions()}
      </SidebarListli>
    );
  }
}

export default NameList;
