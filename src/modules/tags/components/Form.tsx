import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { Alert, generateRandomColorCode } from 'modules/common/utils';
import { ITag, ITagSaveParams } from 'modules/tags/types';
import * as React from 'react';

type Props = {
  tag?: ITag;
  type: string;
  closeModal?: () => void;
  save: (params: ITagSaveParams) => void;
  modal?: boolean;
  afterSave?: () => void;
};

type State = {
  name: string;
  colorCode: string;
};

class Form extends React.Component<Props, State> {
  constructor(props, context) {
    super(props, context);

    const { tag } = props;

    this.state = {
      name: tag ? tag.name : '',
      colorCode: tag ? tag.colorCode : generateRandomColorCode()
    };
  }

  submit = e => {
    e.preventDefault();

    const { modal = true, tag, type, save, closeModal, afterSave } = this.props;
    const { name, colorCode } = this.state;

    if (name.length === 0) {
      return Alert.error('Please enter a tag name');
    }

    if (colorCode.length === 0) {
      return Alert.error('Please choose a tag color code');
    }

    const params = { name, colorCode };

    if (modal) {
      return save({
        tag,
        doc: { ...params, type },
        callback: () => closeModal && closeModal()
      });
    }

    save({ doc: { ...params, type: 'customer' } });

    if (afterSave) {
      afterSave();
    }
  };

  handleName = e => {
    this.setState({ name: e.target.value });
  };

  handleColorCode = e => {
    this.setState({ colorCode: e.target.value });
  };

  render() {
    const { name, colorCode } = this.state;

    return (
      <form onSubmit={this.submit}>
        <FormGroup>
          <ControlLabel>Name</ControlLabel>
          <FormControl
            type="text"
            value={name}
            onChange={this.handleName}
            required={true}
            id="name"
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Color code</ControlLabel>
          <FormControl
            type="color"
            value={colorCode}
            onChange={this.handleColorCode}
            id="colorCode"
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={this.props.closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>

          <Button btnStyle="success" type="submit" icon="checked-1">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default Form;
