import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import Icon from 'modules/common/components/Icon';
import LoadMore from 'modules/common/components/LoadMore';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tip from 'modules/common/components/Tip';
import { TopHeader } from 'modules/common/styles/main';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { __, router } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import Wrapper from 'modules/layout/components/Wrapper';
import { FieldStyle, SidebarList } from 'modules/layout/styles';
import MemberAvatars from 'modules/settings/channels/components/MemberAvatars';
import { ActionButtons } from 'modules/settings/styles';
import React from 'react';
import { withRouter } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { SidebarItem } from '../styles';
import { IUserGroup, IUserGroupDocument } from '../types';
import GroupForm from './GroupForm';

const { Section } = Wrapper.Sidebar;

interface IProps extends IRouterProps {
  queryParams: any;
  refetch: any;
  totalCount: number;
  loading: boolean;
  objects: IUserGroupDocument[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  remove: (id: string) => void;
  copyItem: (id: string, key: string, list?: string[]) => void;
}

class GroupList extends React.Component<IProps> {
  renderFormTrigger(trigger: React.ReactNode, object?: IUserGroup) {
    const content = props => this.renderForm({ ...props, object });

    return (
      <ModalTrigger title="New Group" trigger={trigger} content={content} />
    );
  }

  renderForm = props => {
    const { refetch, renderButton } = this.props;

    const extendedProps = { ...props, refetch };

    return <GroupForm {...extendedProps} renderButton={renderButton} />;
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
        <Tip text={__('Edit')} placement="bottom">
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
        <Tip text={__('Remove')} placement="bottom">
          <Icon icon="cancel-1" />
        </Tip>
      </Button>
    );
  }

  renderCopyAction(object: IUserGroupDocument) {
    const onCopy = () =>
      this.props.copyItem(object._id, 'memberIds', object.memberIds || []);

    const tipText = 'Copies user group along with the permissions & users';

    return (
      <Button btnStyle="link" onClick={onCopy}>
        <Tip text={tipText} placement="bottom">
          <Icon icon="copy" />
        </Tip>
      </Button>
    );
  }

  renderObjects(objects: IUserGroupDocument[]) {
    return objects.map(object => (
      <SidebarItem key={object._id} isActive={this.isActive(object._id)}>
        <Link to={`?groupId=${object._id}`}>
          <FieldStyle>
            {object.name}
            <MemberAvatars
              selectedMemberIds={object.memberIds || []}
              allMembers={object.members || []}
            />
          </FieldStyle>
        </Link>
        <ActionButtons>
          {this.renderCopyAction(object)}
          {this.renderEditAction(object)}
          {this.renderRemoveAction(object)}
        </ActionButtons>
      </SidebarItem>
    ));
  }

  renderContent() {
    const { objects } = this.props;

    return <SidebarList>{this.renderObjects(objects)}</SidebarList>;
  }

  renderSidebarHeader() {
    const trigger = (
      <Button
        id="permission-create-user-group"
        btnStyle="success"
        icon="plus-circle"
        block={true}
      >
        Create user group
      </Button>
    );

    return (
      <>
        <TopHeader>{this.renderFormTrigger(trigger)}</TopHeader>
        <Section.Title>
          {__('User groups')}
          <Section.QuickButtons>
            {router.getParam(this.props.history, 'groupId') && (
              <a href="#cancel" tabIndex={0} onClick={this.clearGroupFilter}>
                <Tip text={__('Clear filter')}>
                  <Icon icon="cancel-1" />
                </Tip>
              </a>
            )}
          </Section.QuickButtons>
        </Section.Title>
      </>
    );
  }

  render() {
    const { totalCount, loading } = this.props;

    return (
      <Sidebar full={true} wide={true} header={this.renderSidebarHeader()}>
        <DataWithLoader
          data={this.renderContent()}
          loading={loading}
          count={totalCount}
          emptyText="There is no group"
          emptyImage="/images/actions/26.svg"
        />
        <LoadMore all={totalCount} loading={loading} />
      </Sidebar>
    );
  }
}

export default withRouter<IProps>(GroupList);
