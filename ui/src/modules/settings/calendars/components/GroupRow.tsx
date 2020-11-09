import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tip from 'modules/common/components/Tip';
import { IButtonMutateProps } from 'modules/common/types';
import React from 'react';
import { Link } from 'react-router-dom';
import { BoardItem } from '../../boards/styles';
import { ActionButtons } from '../../styles';
import { IGroup } from '../types';
import GroupForm from './GroupForm';

type Props = {
  group: IGroup;
  remove: (groupId: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  isActive: boolean;
};

class GroupRow extends React.Component<Props, {}> {
  private size;

  remove = () => {
    const { group } = this.props;

    this.props.remove(group._id);
  };

  renderEditAction() {
    const { group, renderButton } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text="Edit" placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    const content = props => (
      <GroupForm {...props} group={group} renderButton={renderButton} />
    );

    return (
      <ModalTrigger
        size={this.size}
        title="Edit"
        trigger={editTrigger}
        content={content}
      />
    );
  }

  render() {
    const { group, isActive } = this.props;

    return (
      <BoardItem key={group._id} isActive={isActive}>
        <Link to={`?groupId=${group._id}`}>{group.name}</Link>
        <ActionButtons>
          {this.renderEditAction()}
          <Tip text="Delete" placement="bottom">
            <Button btnStyle="link" onClick={this.remove} icon="cancel-1" />
          </Tip>
        </ActionButtons>
      </BoardItem>
    );
  }
}

export default GroupRow;
