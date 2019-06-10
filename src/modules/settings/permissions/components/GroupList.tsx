import { IUser } from 'modules/auth/types';
import {
  Button,
  DataWithLoader,
  Icon,
  LoadMore,
  ModalTrigger,
  Tip
} from 'modules/common/components';
import { IRouterProps } from 'modules/common/types';
import { __, router } from 'modules/common/utils';
import { Sidebar } from 'modules/layout/components';
import { HelperButtons, SidebarList } from 'modules/layout/styles';
import { MemberAvatars } from 'modules/settings/channels/components';
import { ActionButtons, SidebarListItem } from 'modules/settings/styles';
import * as React from 'react';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import { IUserGroup, IUserGroupDocument } from '../types';
import GroupForm from './GroupForm';

interface IProps extends IRouterProps {
  queryParams: any;
  refetch: any;
  totalCount: number;
  loading: boolean;
  users: IUser[];
  objects: IUserGroupDocument[];
  remove: (id: string) => void;
}

class GroupList extends React.Component<IProps> {
  renderFormTrigger(trigger: React.ReactNode, object?: IUserGroup) {
    const content = props => this.renderForm({ ...props, object });

    return (
      <ModalTrigger title="New Group" trigger={trigger} content={content} />
    );
  }

  renderForm = props => {
    const { refetch } = this.props;

    const extendedProps = { ...props, refetch };

    return <GroupForm {...extendedProps} />;
  };

  isActive = (id: string) => {
    const { queryParams } = this.props;
    const currentGroup = queryParams.groupId || '';

    return currentGroup === id;
  };

  clearGroupFilter = () => {
    router.setParams(this.props.history, { groupId: null });
  };

  renderEditAction(object: IUserGroupDocument) {
    const trigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')}>
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return this.renderFormTrigger(trigger, object);
  }

  renderRemoveAction(object: IUserGroupDocument) {
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
    const allMembers = this.props.users || [];

    return objects.map(object => (
      <SidebarListItem key={object._id} isActive={this.isActive(object._id)}>
        <Link to={`?groupId=${object._id}`}>
          {object.name}
          <MemberAvatars
            selectedMemberIds={object.memberIds || []}
            allMembers={allMembers}
          />
        </Link>
        <ActionButtons>
          {this.renderEditAction(object)}
          {this.renderRemoveAction(object)}
        </ActionButtons>
      </SidebarListItem>
    ));
  }

  renderContent() {
    const { objects } = this.props;

    return this.renderObjects(objects);
  }

  renderSidebarHeader() {
    const { Header } = Sidebar;

    const trigger = (
      <a>
        <Tip text={__('Create group')}>
          <Icon icon="add" />
        </Tip>
      </a>
    );

    return (
      <Header uppercase={true}>
        {__('User groups')}

        <HelperButtons>
          {this.renderFormTrigger(trigger)}
          {router.getParam(this.props.history, 'groupId') && (
            <a tabIndex={0} onClick={this.clearGroupFilter}>
              <Tip text={__('Clear filter')}>
                <Icon icon="cancel-1" />
              </Tip>
            </a>
          )}
        </HelperButtons>
      </Header>
    );
  }

  render() {
    const { totalCount, loading } = this.props;

    return (
      <Sidebar full={true} wide={true} header={this.renderSidebarHeader()}>
        <SidebarList>
          <DataWithLoader
            data={this.renderContent()}
            loading={loading}
            count={totalCount}
            emptyText="There is no group"
            emptyImage="/images/actions/26.svg"
          />
          <LoadMore all={totalCount} loading={loading} />
        </SidebarList>
      </Sidebar>
    );
  }
}

export default withRouter<IProps>(GroupList);
