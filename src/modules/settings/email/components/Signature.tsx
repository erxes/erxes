import { EditorState } from 'draft-js';
import {
  Button,
  ControlLabel,
  EmptyState,
  FormControl,
  FormGroup,
  Info
} from 'modules/common/components';
import {
  createStateFromHTML,
  ErxesEditor,
  toHTML
} from 'modules/common/components/editor/Editor';
import { ModalFooter } from 'modules/common/styles/main';
import { __, Alert } from 'modules/common/utils';
import * as React from 'react';
import { IEmailSignatureWithBrand } from '../types';

type Props = {
  signatures: IEmailSignatureWithBrand[];
  save: (signatures: IEmailSignatureWithBrand[], callback: () => void) => void;
  closeModal: () => void;
};

type State = {
  signatures: IEmailSignatureWithBrand[];
  currentId?: string;
  editorState: EditorState;
};

class Signature extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      signatures: props.signatures,
      currentId: undefined,
      editorState: createStateFromHTML(EditorState.createEmpty(), '')
    };
  }

  getEditorContent = editorState => {
    return toHTML(editorState);
  };

  onChangeContent = editorState => {
    this.setState({ editorState });

    const current = this.getCurrent(this.state.currentId);

    if (current) {
      current.signature = this.getEditorContent(editorState);

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

    const editorState = createStateFromHTML(
      EditorState.createEmpty(),
      (current && current.signature) || ''
    );

    return this.setState({ editorState });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { save, closeModal } = this.props;

    if (!this.state.currentId) {
      return Alert.error('Select a brand');
    }

    save(this.state.signatures, closeModal);
  };

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

        <ErxesEditor
          bordered={true}
          editorState={this.state.editorState}
          onChange={this.onChangeContent}
        />
      </FormGroup>
    );
  }

  render() {
    return (
      <div>
        <Info>
          {__('Signatures are only included in response emails.')}
          <br />
          {__('You can use Markdown to format your signature.')}
        </Info>

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
  }
}

export default Signature;
