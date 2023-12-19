import {
  __,
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup,
  MainStyleFormColumn as FormColumn,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import Select from 'react-select-plus';
import { LEVEL } from '../constants';
import { IPackage, IPackageDoc } from '../types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  data?: IPackage;
  closeModal?: () => void;
};

type State = {
  name: string;
  wpId: string;

  level: string;
  price: number;
  duration: number;
  profit: number;
};

class PackageForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { data = {} } = props;
    const nowYear = new Date().getFullYear();

    this.state = {
      name: data.name || '',
      wpId: data.wpId || '',

      level: data.level || '',
      price: data.fuelType || 0,
      duration: data.duration || 0,
      profit: data.profit || 0
    };
  }

  generateDoc = (values: { _id: string } & IPackageDoc) => {
    const { data } = this.props;

    const finalValues = values;

    if (data) {
      finalValues._id = data._id;
    }

    return {
      _id: finalValues._id,
      ...this.state,
      description: finalValues.description,
      name: finalValues.name,
      wpId: finalValues.wpId,
      price: Number(finalValues.price),
      duration: Number(finalValues.duration),
      profit: Number(finalValues.profit)
    };
  };

  renderFormGroup = (label, props) => {
    return (
      <FormGroup>
        <ControlLabel>{label}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  onLevelChange = option => {
    this.setState({ level: option.value });
  };

  renderContent = (formProps: IFormProps) => {
    const data = this.props.data || ({} as IPackage);
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    console.log(this.props);

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              {this.renderFormGroup('Name', {
                ...formProps,
                name: 'name',
                defaultValue: data.name || ''
              })}

              {this.renderFormGroup('WP Id', {
                ...formProps,
                name: 'wpId',
                defaultValue: data.wpId || ''
              })}

              <FormGroup>
                <ControlLabel>Level</ControlLabel>
                <Select
                  value={this.state.level}
                  onChange={this.onLevelChange}
                  options={LEVEL}
                  clearable={false}
                />
              </FormGroup>
            </FormColumn>

            <FormColumn>
              {this.renderFormGroup('Price', {
                ...formProps,
                name: 'price',
                defaultValue: data.price || 0,
                type: 'number'
              })}

              {this.renderFormGroup('Duration', {
                ...formProps,
                name: 'duration',
                defaultValue: data.duration || 0,
                type: 'number'
              })}

              {this.renderFormGroup('Profit', {
                ...formProps,
                name: 'profit',
                defaultValue: data.profit || 0,
                type: 'number'
              })}
            </FormColumn>
          </FormWrapper>
          <FormWrapper>
            <FormColumn>
              <FormGroup>
                <ControlLabel>Description</ControlLabel>
                <FormControl
                  {...formProps}
                  max={140}
                  name="description"
                  componentClass="textarea"
                  defaultValue={data.description || ''}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            Close
          </Button>

          {renderButton({
            passedName: 'package',
            values: this.generateDoc(values),
            callback: closeModal,
            isSubmitted,
            object: this.props.data
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default PackageForm;
