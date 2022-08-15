import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import CommonForm from '@erxes/ui-settings/src/common/components/Form';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import { Button, CollapseContent, ModifiableList, Toggle } from '@erxes/ui/src';
import { FormGroupRow, GridContainer } from '../styles';

type Props = {
  object?;
  generateDoc: (values: any) => any;
} & ICommonFormProps;

type CustomFromGroupProps = {
  children?: React.ReactChild;
  label: string;
  required?: boolean;
  row?: boolean;
  spaceBetween?: boolean;
};

class Form extends React.Component<Props & ICommonFormProps> {
  constructor(props) {
    super(props);
  }

  renderContent = (formProps: IFormProps) => {
    const { object } = this.props;

    const CustomFormGroup = ({
      children,
      label,
      required,
      row,
      spaceBetween,
    }: CustomFromGroupProps) => {
      return (
        <FormGroupRow horizontal={row} spaceBetween={spaceBetween}>
          <ControlLabel required={required}>{label}</ControlLabel>
          {children}
        </FormGroupRow>
      );
    };

    return (
      <>
        <CustomFormGroup label="Risk Assessment Name" required>
          <FormControl
            {...formProps}
            name="name"
            type="text"
            required={true}
            defaultValue={object?.name}
          />
        </CustomFormGroup>
        <CustomFormGroup label="RiskAssessment Description" required>
          <FormControl
            {...formProps}
            name="description"
            type="text"
            required={true}
            defaultValue={object?.description}
          />
        </CustomFormGroup>
        <CustomFormGroup label="RiskAssessment Category">
          <FormControl
            {...formProps}
            name="categoryId"
            type="text"
            defaultValue={object?.categoryId}
          />
        </CustomFormGroup>
        <CustomFormGroup label="RiskAssessment Status">
          <FormControl {...formProps} name="status" type="text" defaultValue={object?.status} />
        </CustomFormGroup>
      </>
    );
  };

  render() {
    return (
      <CommonForm
        {...this.props}
        name="name"
        renderContent={this.renderContent}
        generateDoc={this.props.generateDoc}
        object={this.props.object}
      />
    );
  }
}

export default Form;
