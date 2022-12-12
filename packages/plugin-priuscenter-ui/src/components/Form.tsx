import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Button from '@erxes/ui/src/components/Button';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IAd } from '../types';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';

type Props = {
  closeModal?: () => void;
  afterSave: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  ad?: IAd;
  ads?: IAd[];
} & ICommonFormProps;

type State = {};

type IItem = {
  name: string;
  _id: string;
};

class FormComponent extends React.Component<Props & ICommonFormProps, State> {
  constructor(props: Props) {
    super(props);
  }

  generateDoc = (values: { _id?: string; name: string; content: string }) => {
    const { ad } = this.props;

    const finalValues = values;

    if (ad) {
      finalValues._id = ad._id;
    }

    return {
      ...finalValues
    };
  };

  renderField = (formProps, label, name, type = 'text') => {
    const { ad } = this.props;
    const object = ad || ({} as IAd);

    return (
      <FormGroup>
        <ControlLabel required={false}>{label}</ControlLabel>
        <FormControl
          {...formProps}
          name={name}
          defaultValue={object[name]}
          type={type}
        />
      </FormGroup>
    );
  };

  renderContent = (formProps: IFormProps) => {
    const { ad, afterSave, closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        {this.renderField(formProps, 'Type', 'type')}
        {this.renderField(formProps, 'Title', 'title')}
        {this.renderField(formProps, 'Description', 'description')}
        {this.renderField(formProps, 'Mark', 'mark')}
        {this.renderField(formProps, 'Model', 'model')}
        {this.renderField(formProps, 'Color', 'color')}
        {this.renderField(formProps, 'State', 'state')}

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="times-circle">
            Cancel
          </Button>

          {renderButton({
            passedName: 'ad',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal || afterSave,
            object: ad
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
