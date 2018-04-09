import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Datetime from 'react-datetime';
import Select from 'react-select-plus';
import {
  DataWithLoader,
  Button,
  Icon,
  FormGroup,
  FormControl,
  ControlLabel,
  Tabs,
  TabTitle
} from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { HeaderRow, HeaderContent, FormFooter } from '../../styles/deal';

const propTypes = {
  saveDeal: PropTypes.func.isRequired,
  stageId: PropTypes.string
};

const contextTypes = {
  closeModal: PropTypes.func.isRequired,
  __: PropTypes.func
};

class DealAddForm extends React.Component {
  constructor(props) {
    super(props);

    this.save = this.save.bind(this);

    this.state = { disabled: false };
  }

  save() {
    const { stageId } = this.props;
    const { __ } = this.context;

    const name = document.getElementById('name').value;

    if (!name) {
      return Alert.error(__('Enter name'));
    }

    const doc = {
      name,
      stageId
    };

    // before save, disable save button
    this.setState({ disabled: true });

    this.props.saveDeal(doc, () => {
      // after save, enable save button
      this.setState({ disabled: false });

      this.context.closeModal();
    });
  }

  render() {
    return (
      <Fragment>
        <HeaderRow>
          <HeaderContent>
            <ControlLabel>Name</ControlLabel>
            <FormControl id="name" required />
          </HeaderContent>
        </HeaderRow>

        <FormFooter>
          <Button
            btnStyle="simple"
            onClick={this.context.closeModal}
            icon="close"
          >
            Close
          </Button>

          <Button
            disabled={this.state.disabled}
            btnStyle="success"
            icon="checkmark"
            type="submit"
            onClick={this.save}
          >
            Save
          </Button>
        </FormFooter>
      </Fragment>
    );
  }
}

DealAddForm.propTypes = propTypes;
DealAddForm.contextTypes = contextTypes;

export default DealAddForm;
