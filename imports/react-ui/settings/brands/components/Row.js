import React, { PropTypes, Component } from 'react';
import moment from 'moment';
import { Button, Label } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';
import { BrandForm } from '../containers';
import { ModalTrigger, Tip, ActionButtons } from '/imports/react-ui/common';

const propTypes = {
  brand: PropTypes.object.isRequired,
  removeBrand: PropTypes.func.isRequired,
};

class Row extends Component {
  constructor(props) {
    super(props);

    this.removeBrand = this.removeBrand.bind(this);
  }

  removeBrand() {
    if (!confirm('Are you sure?')) return; // eslint-disable-line no-alert

    const { brand, removeBrand } = this.props;

    removeBrand(brand._id, error => {
      if (error) {
        return Alert.error("Can't delete a brand", error.reason);
      }

      return Alert.success('Congrats', 'Brand has deleted.');
    });
  }

  render() {
    const brand = this.props.brand;

    const editTrigger = (
      <Button bsStyle="link">
        <Tip text="Edit"><i className="ion-edit" /></Tip>
      </Button>
    );

    return (
      <tr>
        <td>{brand.name}</td>
        <td><Label>{brand.code}</Label></td>
        <td>{brand.description}</td>
        <td>{moment(brand.createdAt).format('DD MMM YYYY')}</td>

        <td className="text-right">
          <ActionButtons>
            <ModalTrigger title="Edit brand" trigger={editTrigger}>
              <BrandForm brand={this.props.brand} />
            </ModalTrigger>

            <Tip text="Delete">
              <Button bsStyle="link" onClick={this.removeBrand}>
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
