import ActionButtons from '@erxes/ui/src/components/ActionButtons';
import Button from '@erxes/ui/src/components/Button';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import Tip from '@erxes/ui/src/components/Tip';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';

type Props = {
  size?: 'sm' | 'lg' | 'xl';
  object: any;
  renderForm: (doc: {
    object: any;
    closeModal: () => void;
    save: () => void;
  }) => React.ReactNode;
  additionalActions?: (object: any) => void;
  remove?: (id: string) => void;
  save: () => void;
};

export default class RowActions extends React.Component<Props, {}> {
  remove = () => {
    const { remove } = this.props;

    if (remove) {
      remove(this.props.object._id);
    }
  };

  renderRemoveAction = () => {
    if (!this.props.remove) {
      return null;
    }

    return (
      <Tip text={__('Delete')} placement="top">
        <Button btnStyle="link" onClick={this.remove} icon="times-circle" />
      </Tip>
    );
  };

  renderEditAction = () => {
    const { size, renderForm, object, save } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')} placement="top">
          <Icon icon="edit-3" />
        </Tip>
      </Button>
    );

    const content = props => {
      return renderForm({ ...props, object, save });
    };

    return (
      <ModalTrigger
        size={size}
        title="Edit"
        enforceFocus={false}
        trigger={editTrigger}
        content={content}
      />
    );
  };

  render() {
    const { additionalActions, object } = this.props;

    return (
      <td>
        <ActionButtons>
          {this.renderEditAction()}
          {this.renderRemoveAction()}
          {additionalActions && additionalActions(object)}
        </ActionButtons>
      </td>
    );
  }
}
