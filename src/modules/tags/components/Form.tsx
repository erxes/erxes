import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { generateRandomColorCode } from 'modules/common/utils';
import { ITag, ITagSaveDoc } from 'modules/tags/types';
import React, { Component } from 'react';

type Props = {
  tag?: ITag,
  type: string,
  closeModal: () => void,
  save: (params: { tag: ITag, doc: ITagSaveDoc, callback: () => void }) => void
};

type State = {
  name: string,
  colorCode: string
}

class Form extends Component<Props, State> {
  constructor(props, context) {
    super(props, context);

    const { tag } = props;

    this.state = {
      name: tag ? tag.name : '',
      colorCode: tag ? tag.colorCode : generateRandomColorCode()
    };

    this.submit = this.submit.bind(this);
    this.handleName = this.handleName.bind(this);
    this.handleColorCode = this.handleColorCode.bind(this);
  }

  submit(e) {
    e.preventDefault();

    const { tag, type, save, closeModal } = this.props;
    const { name, colorCode } = this.state;

    save({
      tag,
      doc: { name, type, colorCode },
      callback: () => { closeModal() }
    });
  }

  handleName(e) {
    this.setState({ name: e.target.value });
  }

  handleColorCode(e) {
    this.setState({ colorCode: e.target.value });
  }

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
            required
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
          <Button btnStyle="simple" onClick={this.props.closeModal} icon="cancel-1">
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
