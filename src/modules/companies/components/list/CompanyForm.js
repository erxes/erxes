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
    const name = document.getElementById('company-name');
    const website = document.getElementById('company-website');

    this.props.addCompany({
      doc: {
        name: name.value,
        website: website.value
      },

      callback: () => {
        name.value = '';
        website.value = '';
        if (document.activeElement.name === 'close') this.context.closeModal();
      }
    });
  }

  render() {
    return (
      <form onSubmit={e => this.addCompany(e)}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl id="company-name" type="text" autoFocus required />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Website</ControlLabel>
          <FormControl id="company-website" type="text" required />
        </FormGroup>

        <Modal.Footer>
          <Button btnStyle="success" type="submit">
            <Icon icon="checkmark" />
            Save & New
          </Button>

          <Button btnStyle="primary" type="submit" name="close">
            <Icon icon="close" />
            Save & Close
          </Button>

          <Button
            btnStyle="simple"
            onClick={() => {
              this.context.closeModal();
            }}
          >
            <Icon icon="checkmark" />
            Close
          </Button>
        </Modal.Footer>
      </form>
    );
  }
}

CompanyForm.propTypes = propTypes;
CompanyForm.contextTypes = contextTypes;

export default CompanyForm;
