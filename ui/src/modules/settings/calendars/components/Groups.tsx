import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { TopHeader } from 'modules/common/styles/main';
import { IButtonMutateProps } from 'modules/common/types';
import Sidebar from 'modules/layout/components/Sidebar';
import { SidebarList as List } from 'modules/layout/styles';
import React from 'react';
import { IGroup } from '../types';
import GroupForm from './GroupForm';
import GroupRow from './GroupRow';

type Props = {
  currentGroupId?: string;
  groups: IGroup[];
  remove: (groupId: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  loading: boolean;
};

class Groups extends React.Component<Props, {}> {
  renderItems = () => {
    const { groups, remove, renderButton, currentGroupId } = this.props;

    return groups.map(group => (
      <GroupRow
        key={group._id}
        isActive={currentGroupId === group._id}
        group={group}
        remove={remove}
        renderButton={renderButton}
      />
    ));
  };

  renderGroupForm(props) {
    return <GroupForm {...props} />;
  }

  renderSidebarHeader() {
    const { renderButton } = this.props;

    const addGroup = (
      <Button
        btnStyle="success"
        icon="plus-circle"
        uppercase={false}
        block={true}
      >
        Add New Group
      </Button>
    );

    const content = props => {
      return this.renderGroupForm({ ...props, renderButton });
    };

    return (
      <TopHeader>
        <ModalTrigger
          title={`New Group`}
          trigger={addGroup}
          autoOpenKey="showGroupModal"
          content={content}
        />
      </TopHeader>
    );
  }

  render() {
    const { loading, groups } = this.props;

    return (
      <Sidebar wide={true} header={this.renderSidebarHeader()} full={true}>
        <DataWithLoader
          data={<List>{this.renderItems()}</List>}
          loading={loading}
          count={groups.length}
          emptyText={`There is no group`}
          emptyImage="/images/actions/18.svg"
          objective={true}
        />
      </Sidebar>
    );
  }
}

export default Groups;
