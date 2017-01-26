import React, { PropTypes, Component } from 'react';
import { Button } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import { ModalTrigger, Tip, ActionButtons } from '/imports/react-ui/common';
import { Form } from '../containers';


const propTypes = {
  resTemplate: PropTypes.object.isRequired,
  brands: PropTypes.array.isRequired,
  removeResTemplate: PropTypes.func.isRequired,
};

class Row extends Component {
  constructor(props) {
    super(props);

    this.removeResTemplate = this.removeResTemplate.bind(this);
  }

  removeResTemplate() {
    if (!confirm('Are you sure?')) return; // eslint-disable-line

    const { resTemplate, removeResTemplate } = this.props;

    removeResTemplate(resTemplate._id, (error) => {
      if (error) {
        return Alert.error(error.message);
      }

      return Alert.success('Response template has deleted.');
    });
  }

  render() {
    const { resTemplate, brands } = this.props;

    const editTrigger = (
      <Button bsStyle="link">
        <Tip text="Edit"><i className="ion-edit" /></Tip>
      </Button>
    );

    return (
      <tr>
        <td>{resTemplate.brand().name}</td>
        <td>{resTemplate.name}</td>
        <td>{resTemplate.content}</td>

        <td className="text-right">
          <ActionButtons>
            <ModalTrigger title="Edit resTemplate" trigger={editTrigger}>
              <Form brands={brands} resTemplate={resTemplate} />
            </ModalTrigger>

            <Tip text="Delete">
              <Button bsStyle="link" onClick={this.removeResTemplate}>
                <i className="ion-close-circled" />
              </Button>
            </Tip>
          </ActionButtons>
        </td>
      </tr>
    );
  }
}

Row.propTypes = propTypes;

export default Row;
