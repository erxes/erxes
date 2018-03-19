import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  ControlLabel,
  FormGroup,
  FormControl,
  Button
} from 'modules/common/components';
import { Well } from '../../styles';
import { ModalFooter } from 'modules/common/styles/styles';

const propTypes = {
  signatures: PropTypes.array.isRequired,
  save: PropTypes.func.isRequired
};

class Signature extends Component {
  constructor(props) {
    super(props);

    this.changeCurrent = this.changeCurrent.bind(this);
    this.changeContent = this.changeContent.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      signatures: props.signatures,
      currentId: null
    };
  }

  getCurrent() {
    const currentId = this.state.currentId;

    if (!currentId) {
      return {};
    }

    return this.state.signatures.find(
      signature => signature.brandId.toString() === currentId.toString()
    );
  }

  changeCurrent(e) {
    this.setState({ currentId: e.target.value });
  }

  changeContent(e) {
    const current = this.getCurrent();

    current.content = e.target.value;

    this.setState({ signatures: this.state.signatures });
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.save(this.state.signatures);

    this.context.closeModal();
  }

  render() {
    const current = this.getCurrent() || {};
    const { __, closeModal } = this.context;

    const content = (
      <div>
        <Well>
          {__('Signatures are only included in response emails.')}
          <br />
          {__('You can use Markdown to format your signature.')}
        </Well>

        <form id="signature-form" onSubmit={this.handleSubmit}>
          <FormGroup>
            <ControlLabel>Brand</ControlLabel>

            <FormControl componentClass="select" onChange={this.changeCurrent}>
              <option>------------</option>

              {this.props.signatures.map(signature => (
                <option key={signature.brandId} value={signature.brandId}>
                  {signature.brandName}
                </option>
              ))}
            </FormControl>
          </FormGroup>

          <FormGroup>
            <ControlLabel>Signature</ControlLabel>

            <FormControl
              componentClass="textarea"
              id="content"
              rows={6}
              onChange={this.changeContent}
              value={current.content}
            />
          </FormGroup>
          <ModalFooter>
            <Button btnStyle="simple" onClick={() => closeModal()} icon="close">
              Close
            </Button>

            <Button btnStyle="success" type="submit" icon="checkmark">
              Save
            </Button>
          </ModalFooter>
        </form>
      </div>
    );

    return content;
  }
}

Signature.propTypes = propTypes;
Signature.contextTypes = {
  __: PropTypes.func,
  closeModal: PropTypes.func
};

export default Signature;
