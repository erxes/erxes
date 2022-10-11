import Form from '@erxes/ui/src/components/form/Form';
import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import Button from '@erxes/ui/src/components/Button';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import { I{Name}, IType } from '../types';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils';
import React from 'react';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';

type Props = {
  closeModal?: () => void;
  afterSave: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  {name}?: I{Name};
  {name}s?: I{Name}[];
  types?: IType[];
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

    const { {name} } = this.props;

    this.state = {
      expiryDate: {name}
        ? {name}.expiryDate
        : dayjs()
            .add(30, 'day')
            .toDate()
    };
  }

  onDateChange = value => {
    this.setState({ expiryDate: value });
  };

  generateDoc = (values: { _id?: string; name: string; content: string }) => {
    const { {name} } = this.props;

    const finalValues = values;

    if ({name}) {
      finalValues._id = {name}._id;
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
    const { expiryDate } = this.state;
    const { {name}, types, afterSave, closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;
    const object = {name} || ({} as I{Name});
    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Todo</ControlLabel>
          <FormControl
            {...formProps}
            name='name'
            defaultValue={object.name}
            type='text'
            required={true}
            autoFocus={true}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required={false}>Expiry Date</ControlLabel>
          <Datetime
            inputProps={{ placeholder: __('Click to select a date') }}
            dateFormat='YYYY/MM/DD'
            timeFormat={false}
            value={expiryDate}
            closeOnSelect={true}
            utc={true}
            input={false}
            onChange={this.onDateChange}
          />
        </FormGroup>

        {types && (
          <FormGroup>
            <ControlLabel required={true}>Category</ControlLabel>

            <FormControl
              {...formProps}
              name='typeId'
              componentClass='select'
              defaultValue={object.typeId}
            >
              {this.generateTagOptions(types)}
            </FormControl>
          </FormGroup>
        )}

        <ModalFooter id={'AddTagButtons'}>
          <Button btnStyle='simple' onClick={closeModal} icon='times-circle'>
            Cancel
          </Button>

          {renderButton({
            passedName: '{name}',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal || afterSave,
            object: {name}
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
