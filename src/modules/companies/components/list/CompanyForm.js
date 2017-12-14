import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';
import {
  Button,
  Icon,
  FormGroup,
  FormControl,
  ControlLabel
} from 'modules/common/components';

const propTypes = {
  addCompany: PropTypes.func.isRequired
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired
};

class CompanyForm extends React.Component {
  constructor(props) {
    super(props);

    this.addCompany = this.addCompany.bind(this);
  }

  addCompany(e) {
    e.preventDefault();

    this.props.addCompany({
      doc: {
        name: document.getElementById('company-name').value,
        website: document.getElementById('company-website').value
      },

      callback: () => {
        document.getElementById('company-name').value = '';
        document.getElementById('company-website').value = '';
      }
    });
  }

  render() {
    const onClick = e => {
      this.addCompany(e);
      this.context.closeModal();
    };

    return (
      <form onSubmit={this.addCompany}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl id="company-name" type="text" autoFocus required />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Website</ControlLabel>
          <FormControl id="company-website" type="text" required />
        </FormGroup>

        <Modal.Footer>
          <Button btnStyle="simple" onClick={e => onClick(e)}>
            <Icon icon="close" />
            Save&Close
          </Button>

          <Button btnStyle="success" onClick={e => this.addCompany(e)}>
            <Icon icon="checkmark" />
            Save&New
          </Button>
        </Modal.Footer>
      </form>
    );
  }
}

CompanyForm.propTypes = propTypes;
CompanyForm.contextTypes = contextTypes;

export default CompanyForm;
