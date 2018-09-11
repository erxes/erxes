import {
  ActionButtons,
  Button,
  Icon,
  ModalTrigger,
  Tip
} from 'modules/common/components';
import PropTypes from 'prop-types';
import * as React from 'react';

type Props = {
  object: any,
  remove: (_id: string) => void,
  save: () => void,
};

class Row extends React.Component<Props, {}> {
  static contextTypes =  {
    __: PropTypes.func
  }
  
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
    const { __ } = this.context;
    return (
      <Tip text={__('Delete')}>
        <Button btnStyle="link" onClick={this.remove} icon="cancel-1" />
      </Tip>
    );
  }

  renderEditAction() {
    const { object, save } = this.props;
    const { __ } = this.context;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text={__('Edit')}>
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
