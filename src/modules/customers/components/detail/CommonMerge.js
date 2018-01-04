import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import {
  Button,
  Icon,
  FormControl,
  FormGroup,
  ControlLabel
} from 'modules/common/components';
import { Alert } from 'modules/common/utils';

const propTypes = {
  datas: PropTypes.array.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class CommonMerge extends React.Component {
  constructor(props) {
    super(props);
  }

  renderOptions(field) {
    const { datas } = this.props;

    return datas.map(data => {
      return <option key={data._id}>{data[field] || ''}</option>;
    });
  }

  render() {
    return (
      <div>
        <FormGroup>
          <ControlLabel>First Name</ControlLabel>
          <FormControl componentClass="select">
            {this.renderOptions('firstName')}
          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Last Name</ControlLabel>
          <FormControl componentClass="select">
            {this.renderOptions('lastName')}
          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Email</ControlLabel>
          <FormControl componentClass="select">
            {this.renderOptions('email')}
          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Phone</ControlLabel>
          <FormControl componentClass="select">
            {this.renderOptions('phone')}
          </FormControl>
        </FormGroup>
        <Modal.Footer>
          <Button btnStyle="simple" onClick={() => this.context.closeModal()}>
            <Icon icon="close" />CANCEL
          </Button>
          <Button btnStyle="success">
            <Icon icon="checkmark" />SAVE
          </Button>
        </Modal.Footer>
      </div>
    );
  }
}

CommonMerge.propTypes = propTypes;
CommonMerge.contextTypes = contextTypes;

export default CommonMerge;
