import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Button from '@erxes/ui/src/components/Button';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IDictionary, IParent } from '../types';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';

type Props = {
  closeModal?: () => void;
  afterSave: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  zms?: IDictionary;
  zmss?: IDictionary[];
  parents?: IParent[];
} & ICommonFormProps;

type State = {
  expiryDate?: Date;
};

type IItem = {
  order?: string;
  name: string;
  _id: string;
};

class FormComponent extends React.Component<Props & ICommonFormProps, State> {
  constructor(props: Props) {
    super(props);

    const { zms } = this.props;

    // this.state = {
    //   expiryDate: zms
    //     ? zms.expiryDate
    //     : dayjs()
    //         .add(30, 'day')
    //         .toDate()
    // };
  }

  onDateChange = value => {
    this.setState({ expiryDate: value });
  };

  generateDoc = (values: { _id?: string; name: string; content: string }) => {
    const { zms } = this.props;

    const finalValues = values;

    if (zms) {
      finalValues._id = zms._id;
    }

    return {
      ...finalValues,
      expiryDate: this.state.expiryDate
    };
  };

  generateTagOptions = (types: IItem[]) => {
    const result: React.ReactNode[] = [];

    for (const type of types) {
      result.push(
        <option key={type._id} value={type._id}>
          {type.name}
        </option>
      );
    }

    return result;
  };

  renderContent = (formProps: IFormProps) => {
    const { zms, parents, afterSave, closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;
    const object = zms || ({} as IDictionary);
    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Parent</ControlLabel>
          <FormControl
            {...formProps}
            name="parentId"
            defaultValue={object.name}
            type="text"
            required={true}
            autoFocus={true}
          />
        </FormGroup>
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
            name="parentId"
            defaultValue={object.name}
            type="text"
            required={true}
            autoFocus={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={true}>Code</ControlLabel>
          <FormControl
            {...formProps}
            name="parentId"
            defaultValue={object.name}
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
            object: zms
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
