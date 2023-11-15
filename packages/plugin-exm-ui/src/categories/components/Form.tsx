import {
  ControlLabel,
  FormControl,
  FormGroup,
  __,
  Form as CommonForm,
  Button
} from '@erxes/ui/src';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import { SelectCategories } from '../SelectCategories';
import { ModalFooter } from '@erxes/ui/src/styles/main';

type Props = {
  category?: any;
  renderButton: (props: IButtonMutateProps) => void;
  remove: (id: string) => void;
};

type State = {
  doc: any;
};

class Form extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      doc: props?.category || {}
    };

    this.renderForm = this.renderForm.bind(this);
  }

  generateDoc(values) {
    return { ...values, ...this.state.doc };
  }

  renderForm(formProps: IFormProps) {
    const { values, isSubmitted } = formProps;
    const { doc } = this.state;
    const { remove, category } = this.props;
    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>{__('Name')}</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            defaultValue={doc?.name}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Description')}</ControlLabel>
          <FormControl
            defaultValue={doc?.description}
            {...formProps}
            name="description"
            componentClass="textarea"
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>{__('Code')}</ControlLabel>
          <FormControl
            {...formProps}
            name="code"
            defaultValue={doc?.code}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Parent')}</ControlLabel>
          <SelectCategories
            name="parentId"
            label="Parent"
            initialValue={doc.parentId}
            filterParams={{ excludeIds: category?._id ? [category._id] : [] }}
            onSelect={value =>
              this.setState({ doc: { ...doc, parentId: value } })
            }
          />
        </FormGroup>
        <ModalFooter>
          {category && (
            <Button
              btnStyle="danger"
              icon="minus-circle"
              onClick={remove.bind(this, category?._id)}
            >
              {__('Delete')}
            </Button>
          )}
          {this.props.renderButton({
            name: 'category',
            values: this.generateDoc(values),
            isSubmitted,
            object: category
          })}
        </ModalFooter>
      </>
    );
  }

  render() {
    return <CommonForm renderContent={this.renderForm} />;
  }
}

export default Form;
