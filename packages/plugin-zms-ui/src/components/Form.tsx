import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Button from '@erxes/ui/src/components/Button';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IDictionary, IParent } from '../types';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';

type Props = {
  parentId: string;
  closeModal?: () => void;
  afterSave: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  dictionary?: IDictionary;
  dictionaries?: IDictionary[];
  parents?: IParent[];
} & ICommonFormProps;

type State = {
  name?: string;
  code?: string;
  type?: string;
  parentId: string;
};

type IItem = {
  order?: string;
  name: string;
  _id: string;
};

class FormComponent extends React.Component<Props & ICommonFormProps, State> {
  constructor(props: Props) {
    super(props);

    const { dictionary, parentId } = this.props;
    console.log('dictionary:', dictionary);
    this.state = {
      name: dictionary?.name,
      code: dictionary?.code,
      type: dictionary?.type,
      parentId
    };
  }

  generateDoc = (values: {
    _id?: string;
    name: string;
    code: string;
    type: string;
  }) => {
    const { dictionary } = this.props;

    const finalValues: any = values;

    if (dictionary) {
      finalValues.id = dictionary._id;
    }

    finalValues.parentId = this.state.parentId;

    return {
      ...finalValues
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { dictionary, afterSave, closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;
    const object = dictionary || ({} as IDictionary);
    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            defaultValue={object.name}
            type="text"
            required={true}
            autoFocus={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>Type</ControlLabel>
          <FormControl
            {...formProps}
            name="type"
            defaultValue={object.type}
            type="text"
            required={true}
            autoFocus={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>Code</ControlLabel>
          <FormControl
            {...formProps}
            name="code"
            defaultValue={object.code}
            type="text"
            required={true}
            autoFocus={true}
          />
        </FormGroup>
        <ModalFooter id={'AddTagButtons'}>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Cancel
          </Button>

          {renderButton({
            passedName: 'zms',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal || afterSave,
            object: dictionary
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default FormComponent;
