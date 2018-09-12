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
  object: any,
  remove: (_id: string) => void,
  save: () => void,
};

class Row extends React.Component<Props, {}> {
  private size;

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

  renderForm(doc) {
    return null;
  }

  renderEditAction() {
    const { object, save } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit').toString()}>
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger size={this.size} title="Edit" trigger={editTrigger}>
        {this.renderForm({ object, save })}
      </ModalTrigger>
    );
  }

  renderActions() {
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

export default Row;
