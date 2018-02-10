import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import { Button, ModalTrigger, Icon } from 'modules/common/components';
import { DealFormContainer, DealButton } from '../../styles';
import { ProductForm } from '../';

const propTypes = {
  addDeal: PropTypes.func.isRequired,
  close: PropTypes.func.isRequired
};

class DealForm extends React.Component {
  constructor(props) {
    super(props);

    this.addDeal = this.addDeal.bind(this);
  }

  addDeal(e) {
    e.preventDefault();
    const name = document.getElementById('stage-name');

    this.props.addDeal({
      doc: {
        name: name.value,
        boardId: '1234'
      },

      callback: () => {
        this.props.close();
      }
    });
  }

  render() {
    const productTrigger = (
      <DealButton>
        Select Product & Service <Icon icon="plus" />
      </DealButton>
    );

    const companyTrigger = (
      <DealButton>
        Select Company <Icon icon="plus" />
      </DealButton>
    );

    const customerTrigger = (
      <DealButton>
        Select Customer <Icon icon="plus" />
      </DealButton>
    );

    const assignedToTrigger = (
      <DealButton>
        Assigned to <Icon icon="plus" />
      </DealButton>
    );

    return (
      <DealFormContainer>
        <form onSubmit={e => this.addDeal(e)}>
          <ModalTrigger
            size="large"
            title="New Product & Service"
            trigger={productTrigger}
          >
            <ProductForm addProduct={() => {}} />
          </ModalTrigger>
          <ModalTrigger title="Company" trigger={companyTrigger}>
            <ProductForm addProduct={() => {}} />
          </ModalTrigger>
          <ModalTrigger title="Customer" trigger={customerTrigger}>
            <ProductForm addProduct={() => {}} />
          </ModalTrigger>
          <ModalTrigger title="Assigned to" trigger={assignedToTrigger}>
            <ProductForm addProduct={() => {}} />
          </ModalTrigger>
          <Modal.Footer>
            <Button
              btnStyle="simple"
              onClick={() => {
                this.props.close();
              }}
              icon="close"
            >
              Close
            </Button>

            <Button btnStyle="success" type="submit" icon="checkmark">
              Save
            </Button>
          </Modal.Footer>
        </form>
      </DealFormContainer>
    );
  }
}

DealForm.propTypes = propTypes;

export default DealForm;
