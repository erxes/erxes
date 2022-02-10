import Button from '@erxes/ui/src/components/Button';
import EditorCK from '@erxes/ui/src/components/EditorCK';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Info from '@erxes/ui/src/components/Info';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __, Alert } from '@erxes/ui/src/utils';
import { MAIL_TOOLBARS_CONFIG } from '@erxes/ui/src/constants/integrations';
import React from 'react';
import { IEmailSignatureWithBrand } from '../types';

type Props = {
  signatures: IEmailSignatureWithBrand[];
  save: (signatures: IEmailSignatureWithBrand[], callback: () => void) => void;
  closeModal: () => void;
};

type State = {
  signatures: IEmailSignatureWithBrand[];
  currentId?: string;
  content: string;
  isSaved: boolean;
};

class Signature extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      signatures: props.signatures,
      currentId: undefined,
      content: '',
      isSaved: false
    };

    this.close = this.close.bind(this);
  }

  onChangeContent = e => {
    const content = e.editor.getData();
    this.setState({ content });

    const current = this.getCurrent(this.state.currentId);

    if (current) {
      current.signature = content;

      this.setState({ signatures: this.state.signatures });
    }
  };

  getCurrent = (currentId?: string) => {
    if (!currentId) {
      return { signature: '' };
    }

    return this.state.signatures.find(
      signature => (signature.brandId || '').toString() === currentId
    );
  };

  changeCurrent = e => {
    const currentId = e.target.value;

    this.setState({ currentId });

    const current = this.getCurrent(currentId);

    return this.setState({ content: (current && current.signature) || '' });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { save } = this.props;

    if (!this.state.currentId) {
      return Alert.error('Select a brand');
    }

    save(this.state.signatures, this.close);
  };

  close() {
    this.setState({ isSaved: true }, () => {
      this.props.closeModal();
    });
  }

  renderSignatureEditor() {
    if (!this.state.currentId) {
      return (
        <EmptyState text="Nothing selected" image="/images/actions/29.svg" />
      );
    }

    return (
      <FormGroup>
        <ControlLabel>Signature</ControlLabel>
        <p>
          {__(
            'An email signature is an opportunity to share information that helps build recognition and trust.'
          )}
        </p>

        <EditorCK
          content={this.state.content}
          toolbar={MAIL_TOOLBARS_CONFIG}
          autoFocus={true}
          autoGrow={true}
          autoGrowMinHeight={160}
          onChange={this.onChangeContent}
          name={`signature_${this.state.currentId}`}
          isSubmitted={this.state.isSaved}
        />
      </FormGroup>
    );
  }

  render() {
    return (
      <div>
        <Info>{__('You can use Markdown to format your signature.')}</Info>

        <form id="signature-form" onSubmit={this.handleSubmit}>
          <FormGroup>
            <ControlLabel required={true}>Choose a brand</ControlLabel>

            <FormControl componentClass="select" onChange={this.changeCurrent}>
              <option value="">------------</option>

              {this.props.signatures.map(signature => (
                <option key={signature.brandId} value={signature.brandId}>
                  {signature.brandName}
                </option>
              ))}
            </FormControl>
          </FormGroup>

          {this.renderSignatureEditor()}
          <ModalFooter>
            <Button btnStyle="simple" onClick={this.close} icon="times-circle">
              Close
            </Button>

            <Button btnStyle="success" type="submit" icon="check-circle">
              Save
            </Button>
          </ModalFooter>
        </form>
      </div>
    );
  }
}

export default Signature;
