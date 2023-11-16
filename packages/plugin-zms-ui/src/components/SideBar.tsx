import { __ } from '@erxes/ui/src/utils/core';
import LeftSidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { Link } from 'react-router-dom';
import { IParent } from '../types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import TypeForm from './TypeForm';
import Button from '@erxes/ui/src/components/Button';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { Header, SidebarListItem } from '@erxes/ui-settings/src/styles';
import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Tip from '@erxes/ui/src/components/Tip';
import Icon from '@erxes/ui/src/components/Icon';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal?: () => void;
  afterSave?: () => void;
  remove: (type: IParent) => void;
  parents: IParent[];
  currentTypeId?: string;
};

type State = {
  type?: IParent;
};

class SideBar extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { type: undefined };
  }

  trigger = (
    <Button
      id={'AddParentButton'}
      btnStyle="success"
      icon="plus-circle"
      block={true}
    >
      Create Parent
    </Button>
  );

  editTrigger = (
    <Button btnStyle="link">
      <Tip text={__('Edit')}>
        <Icon icon="edit-3"></Icon>
      </Tip>
    </Button>
  );

  ListItem = (type, currentTypeName) => {
    const { remove } = this.props;
    const className = type && currentTypeName === type._id ? 'active' : '';
    const content = props => {
      const { renderButton } = this.props;
      return <TypeForm {...props} type={type} renderButton={renderButton} />;
    };
    return (
      <SidebarListItem isActive={className === 'active'} key={type._id}>
        <Link to={`/zmss?parentId=${type._id}`}>{__(type.name)}</Link>
        {className && (
          <ActionButtons>
            <ModalTrigger
              size="sm"
              title="Edit type"
              trigger={this.editTrigger}
              content={content}
              enforceFocus={false}
            />

            <Tip text={__('Delete')} placement="top">
              <Button
                btnStyle="link"
                onClick={remove.bind(null, type)}
                icon="times-circle"
              />
            </Tip>
          </ActionButtons>
        )}
      </SidebarListItem>
    );
  };

  modalContent = props => {
    const { renderButton } = this.props;
    return <TypeForm {...props} renderButton={renderButton} />;
  };

  render() {
    const { parents, currentTypeId } = this.props;

    return (
      <LeftSidebar
        header={
          <Header>
            <ModalTrigger
              size="sm"
              title={__('Add Parents')}
              trigger={this.trigger}
              content={this.modalContent}
            />
          </Header>
        }
        hasBorder
      >
        <LeftSidebar.Header uppercase={true}>
          {__('Parents')}
        </LeftSidebar.Header>

        <SidebarList noTextColor noBackground id="SideBar">
          {parents.map(type => {
            return this.ListItem(type, currentTypeId);
          })}
        </SidebarList>
      </LeftSidebar>
    );
  }
}

export default SideBar;
