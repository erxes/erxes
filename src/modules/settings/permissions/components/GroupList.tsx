import {
  Button,
  DataWithLoader,
  Icon,
  LoadMore,
  ModalTrigger,
  Tip
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Sidebar } from 'modules/layout/components';
import { HelperButtons, SidebarList } from 'modules/layout/styles';
import { ActionButtons, SidebarListItem } from 'modules/settings/styles';
import * as React from 'react';
import { IUserGroup, IUserGroupDocument } from '../types';
import GroupForm from './GroupForm';

type Props = {
  totalCount: number;
  loading: boolean;
  objects: IUserGroupDocument[];
  save: (doc: IUserGroup, callback: () => void, object: any) => void;
  remove: (id: string) => void;
};

class GroupList extends React.Component<Props> {
  renderFormTrigger(trigger: React.ReactNode, object) {
    const content = props => this.renderForm({ ...props, object });

    return (
      <ModalTrigger title="New Group" trigger={trigger} content={content} />
    );
  }

  renderForm = props => {
    const { save } = this.props;

    const extendedProps = { ...props, save };

    return <GroupForm {...extendedProps} />;
  };

  renderEditActions(object: IUserGroupDocument) {
    const trigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')}>
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return this.renderFormTrigger(trigger, object);
  }

  renderRemoveActions(object: IUserGroupDocument) {
    const { remove } = this.props;

    return (
      <Button btnStyle="link" onClick={remove.bind(null, object._id)}>
        <Tip text={__('Remove')}>
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  }

  renderObjects(objects: IUserGroupDocument[]) {
    return objects.map(object => (
      <SidebarListItem key={object._id} isActive={false}>
        <a>{object.name}</a>
        <ActionButtons>
          {this.renderEditActions(object)}
          {this.renderRemoveActions(object)}
        </ActionButtons>
      </SidebarListItem>
    ));
  }

  renderContent() {
    const { objects } = this.props;

    return this.renderObjects(objects);
  }

  renderSidebarHeader() {
    const { save } = this.props;
    const { Header } = Sidebar;

    const trigger = (
      <HelperButtons>
        <a>
          <Icon icon="add" />
        </a>
      </HelperButtons>
    );

    return (
      <Header uppercase={true}>
        {__('User groups')}

        {this.renderFormTrigger(trigger, null)}
      </Header>
    );
  }

  render() {
    const { totalCount, loading } = this.props;

    return (
      <Sidebar full={true} header={this.renderSidebarHeader()}>
        <SidebarList>
          <DataWithLoader
            data={this.renderContent()}
            loading={loading}
            count={totalCount}
            emptyText="There is no data."
            emptyImage="/images/actions/26.svg"
          />
          <LoadMore all={totalCount} loading={loading} />
        </SidebarList>
      </Sidebar>
    );
  }
}

export default GroupList;
