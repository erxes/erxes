import React, { Component } from 'react';
// import { Link } from 'react-router-dom';
import { ModalTrigger } from 'modules/common/components';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { SidebarList } from 'modules/layout/styles';
import { ChannelForm } from '../containers';
import { SidebarListli, Members, MemberImg } from '../styles';

const propTypes = {
  objects: PropTypes.array.isRequired,
  members: PropTypes.array.isRequired
};

class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.renderMembers = this.renderMembers.bind(this);
    this.generateMembersParams = this.generateMembersParams.bind(this);

    this.state = {
      // selectedMembers: this.generateMembersParams(props.selectedMembers)
    };
  }

  renderForm(props) {
    return <ChannelForm {...props} />;
  }

  generateMembersParams() {
    const { members } = this.props;

    return members.map(member => ({
      value: member._id,
      label: member.details.fullName || ''
    }));
  }

  renderMembers(member) {
    return (
      <MemberImg
        key={member._id}
        src={(member.details && member.details.avatar) || []}
      />
    );
  }

  renderChannelName(object) {
    return <a href={`?id=${object._id}`}>{object.name}</a>;
  }

  render() {
    const { objects, members } = this.props;
    const { Title } = Wrapper.Sidebar.Section;
    // console.log(this.state.selectedMembers);
    return (
      <Wrapper.Sidebar>
        <Wrapper.Sidebar.Section>
          <Title>Channels</Title>
          <SidebarList>
            {objects.map(object => (
              <SidebarListli key={object._id}>
                {this.renderChannelName(object)}
                <Members>
                  {members.map(member => this.renderMembers(member))}
                </Members>
              </SidebarListli>
            ))}
          </SidebarList>
        </Wrapper.Sidebar.Section>
      </Wrapper.Sidebar>
    );
  }
}

Sidebar.propTypes = propTypes;

export default Sidebar;
