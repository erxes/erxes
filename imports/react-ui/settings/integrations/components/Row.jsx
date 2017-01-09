import React, { PropTypes, Component } from 'react';
import { Button } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import { Tip, ActionButtons } from '/imports/react-ui/common';


const propTypes = {
  integration: PropTypes.object.isRequired,
  brands: PropTypes.array.isRequired,
  removeIntegration: PropTypes.func.isRequired,
};

class Row extends Component {
  constructor(props) {
    super(props);

    this.removeIntegration = this.removeIntegration.bind(this);
  }

  removeIntegration() {
    if (!confirm('Are you sure?')) return; // eslint-disable-line no-alert

    const { integration, removeIntegration } = this.props;

    removeIntegration(integration._id, error => {
      if (error) {
        return Alert.error('Can\'t delete a integration', error.reason);
      }

      return Alert.success('Congrats', 'Integration has deleted.');
    });
  }

  render() {
    const integration = this.props.integration;

    return (
      <tr>
        <td>{integration.name}</td>
        <td>{integration.kind}</td>
        <td>{integration.brand().name}</td>

        <td className="text-right">
          <ActionButtons>
            <Tip text="Delete">
              <Button bsStyle="link" onClick={this.removeIntegration}>
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
