import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { Tip } from 'modules/common/components';
import { SidebarList } from 'modules/layout/styles';
import { SidebarListli, Members, MemberImg, More } from '../styles';

const propTypes = {
  objects: PropTypes.array.isRequired,
  members: PropTypes.array.isRequired
};

class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isMembervisible: true
    };

    this.renderMember = this.renderMember.bind(this);
    this.renderChannelName = this.renderChannelName.bind(this);
    this.toggleMember = this.toggleMember.bind(this);
  }

  toggleMember() {
    this.setState({ isMembervisible: !this.state.isMembervisible });
  }

  renderChannelName(object) {
    return <Link to={`?id=${object._id}`}>{object.name}</Link>;
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
    const { objects, members } = this.props;
    const { Title } = Wrapper.Sidebar.Section;
    const limit = 10;
    const { isMembervisible } = this.state;
    const length = members.length;

    const Tooltip = (
      <Tip placement="top" text="View more">
        <More>{`+${length - limit}`}</More>
      </Tip>
    );

    return (
      <Wrapper.Sidebar>
        <Wrapper.Sidebar.Section>
          <Title>Channels</Title>
          <SidebarList>
            {objects.map(object => (
              <SidebarListli key={object._id}>
                {this.renderChannelName(object)}
                <Members onClick={this.toggleMember}>
                  {members
                    .slice(0, limit && isMembervisible ? limit : length)
                    .map(member => this.renderMember(member))}
                  {limit && isMembervisible && length - limit > 0 && Tooltip}
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
