import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ModalFooter, Well } from 'modules/common/styles/main';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { IEmailSignatureWithBrand } from '../types';

type Props = {
  signatures: IEmailSignatureWithBrand[];
  save: (signatures: IEmailSignatureWithBrand[]) => void;
  closeModal: () => void;
};

type State = {
  signatures: IEmailSignatureWithBrand[];
  currentId?: string;
};

class Signature extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.changeCurrent = this.changeCurrent.bind(this);
    this.changeContent = this.changeContent.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);

    this.state = {
      signatures: props.signatures,
      currentId: undefined
    };
  }

  getCurrent() {
    const currentId = this.state.currentId;

    if (!currentId) {
      return { signature: '' };
    }

    return this.state.signatures.find(
      signature => (signature.brandId || '').toString() === currentId
    );
  }

  changeCurrent(e) {
    this.setState({ currentId: e.target.value });
  }

  changeContent(e) {
    const current = this.getCurrent();

    if (current) {
      current.signature = e.target.value;

      this.setState({ signatures: this.state.signatures });
    }
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.save(this.state.signatures);

    this.props.closeModal();
  }

  render() {
    const current = this.getCurrent();

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
              value={current && current.signature}
            />
          </FormGroup>
          <ModalFooter>
            <Button
              btnStyle="simple"
              onClick={this.props.closeModal}
              icon="cancel-1"
            >
              Close
            </Button>

            <Button btnStyle="success" type="submit" icon="checked-1">
              Save
            </Button>
          </ModalFooter>
        </form>
      </div>
    );

    return content;
  }
}

export default Signature;
