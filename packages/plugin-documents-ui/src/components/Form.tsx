import {
  Button,
  Form as CommonForm,
  ControlLabel,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components';

import EditorCK from '../containers/EditorCK';
import { IFormProps } from '@erxes/ui/src/types';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import React from 'react';
import { __ } from 'coreui/utils';
import styled from 'styled-components';

type Props = {
  contentType: string;
  subTypes: string[];
  obj: any;
  save: (doc) => void;
  closeModal: () => void;
};

type State = {
  name?: string;
  content?: string;
  replacer?: string;
  subType?: string;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { obj } = props;

    this.state = { name: obj.name, content: obj.content, subType: obj.subType };
  }

  onContentChange = e => {
    this.setState({ content: e.editor.getData() });
  };

  onChangeField = (key, e) => {
    this.setState({ [key]: e.currentTarget.value });
  };

  onSave = () => {
    const { name, content, replacer, subType } = this.state;

    this.props.save({
      name,
      content,
      replacer,
      subType
    });
  };

  renderContent = (formProps: IFormProps) => {
    const { obj, contentType, subTypes, closeModal } = this.props;
    const { content, subType } = this.state;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>

          <FormControl
            name="name"
            required={true}
            autoFocus={true}
            defaultValue={obj.name}
            onChange={this.onChangeField.bind(this, 'name')}
            {...formProps}
          />
        </FormGroup>

        <FormGroup>
          <div style={{ float: 'left', width: '100%' }}>
            <EditorCK
              contentType={obj.contentType || contentType}
              content={obj.content}
              onChange={this.onContentChange}
              height={200}
              name="document-form"
            />
          </div>

          <div style={{ clear: 'both' }} />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Replacer</ControlLabel>

          <FormControl
            componentClass="textarea"
            name="name"
            required={true}
            defaultValue={obj.replacer}
            onChange={this.onChangeField.bind(this, 'replacer')}
            {...formProps}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>Sub Type</ControlLabel>

          <FormControl
            componentClass="select"
            name="subType"
            value={subType}
            onChange={this.onChangeField.bind(this, 'subType')}
            {...formProps}
          >
            <option key="" value="" />
            {(subTypes || []).map(e => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </FormControl>
        </FormGroup>

        <ModalFooter>
          <Button btnStyle="simple" type="button" onClick={closeModal}>
            {__('Cancel')}
          </Button>

          <Button onClick={this.onSave} btnStyle="success" type="button">
            {__('Save')}
          </Button>
        </ModalFooter>
      </>
    );
  };

  render() {
    return <CommonForm autoComplete="off" renderContent={this.renderContent} />;
  }
}

export default Form;
