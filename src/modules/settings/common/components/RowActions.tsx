import {
  ActionButtons,
  Button,
  Icon,
  ModalTrigger,
  Tip
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';

type Props = {
  size?: string;
  object: any,
  renderForm: (doc: { object: any, closeModal: () => void, save: () => void }) => void,
  remove: (_id: string) => void,
  save: () => void,
};

export default class RowActions extends React.Component<Props, {}> {
  constructor(props: Props) {
    super(props);

    this.remove = this.remove.bind(this);
    this.renderRemoveAction = this.renderRemoveAction.bind(this);
    this.renderEditAction = this.renderEditAction.bind(this);
  }

  remove() {
    this.props.remove(this.props.object._id);
  }

  renderRemoveAction() {
    return (
      <Tip text={__('Delete').toString()}>
        <Button btnStyle="link" onClick={this.remove} icon="cancel-1" />
      </Tip>
    );
  }

  renderEditAction() {
    const { size, renderForm, object, save } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit').toString()}>
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger
        size={size}
        title="Edit"
        trigger={editTrigger}
        content={(props) => {
          return renderForm({ ...props, object, save })
        }}
      />
    );
  }

  render() {
    return (
      <td>
        <ActionButtons>
          {this.renderEditAction()}
          {this.renderRemoveAction()}
        </ActionButtons>
      </td>
    );
  }
}
