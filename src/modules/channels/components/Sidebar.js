import React from 'react';
import { List } from '../common';
import { Wrapper } from 'modules/layout/components';
import { Icon, ModalTrigger, Spinner } from 'modules/common/components';
import { NameList } from './';
import { SidebarList } from 'modules/layout/styles';
import { RightButton } from '../styles';
import { ChannelForm } from '../containers';

class Sidebar extends List {
  renderChannelName(props) {
    return <NameList {...props} />;
  }

  renderForm(props) {
    return <ChannelForm {...props} />;
  }

  renderContent() {
    const { save, loading } = this.props;
    const { Title } = Wrapper.Sidebar.Section;
    const AddChannel = (
      <RightButton>
        <Icon icon="plus" />
      </RightButton>
    );

    return (
      <Wrapper.Sidebar full>
        <Wrapper.Sidebar.Section>
          <Title>Channels</Title>
          <ModalTrigger title="New Channel" trigger={AddChannel}>
            {this.renderForm({ save })}
          </ModalTrigger>
          <SidebarList>{this.renderObjects()}</SidebarList>
        </Wrapper.Sidebar.Section>
        {loading && <Spinner />}
      </Wrapper.Sidebar>
    );
  }

  breadcrumb() {
    return [{ title: 'Channels' }];
  }
}

export default Sidebar;
