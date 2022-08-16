import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IFormProps } from '@erxes/ui/src/types';
import React from 'react';
import CommonForm from '@erxes/ui-settings/src/common/components/Form';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import { Button, CollapseContent, ModifiableList, Spinner, Toggle } from '@erxes/ui/src';
import { FormGroupRow, GridContainer } from '../styles';
import { RiskAssesmentsType, RiskAssessmentCategory } from '../common/types';
import { subOption } from '../common/utils';

type Props = {
  generateDoc: (values: any) => any;
  categories: RiskAssessmentCategory[];
  loading: boolean;
  assessmentDetail?: RiskAssesmentsType;
  detailLoading?: boolean;
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
    const { categories, loading, detailLoading, assessmentDetail } = this.props;

    const CustomFormGroup = ({ children, label, required, row, spaceBetween }: CustomFromGroupProps) => {
      return (
        <FormGroupRow horizontal={row} spaceBetween={spaceBetween}>
          <ControlLabel required={required}>{label}</ControlLabel>
          {children}
        </FormGroupRow>
      );
    };

    if (detailLoading) {
      return <Spinner objective />;
    }

    return (
      <>
        <CustomFormGroup label="Risk Assessment Name" required>
          <FormControl {...formProps} name="name" type="text" required={true} defaultValue={assessmentDetail?.name} />
        </CustomFormGroup>
        <CustomFormGroup label="RiskAssessment Description" required>
          <FormControl {...formProps} name="description" type="text" required={true} defaultValue={assessmentDetail?.description} />
        </CustomFormGroup>
        <CustomFormGroup label="RiskAssessment Category">
          {loading ? (
            <Spinner objective />
          ) : (
            <FormControl {...formProps} name="categoryId" componentClass="select" defaultValue={assessmentDetail?.categoryId}>
              <option />
              {categories.map((category) => (
                <option value={category._id} key={category._id}>
                  {category.parentId && subOption(category)}
                  {category.name}
                </option>
              ))}
            </FormControl>
          )}
        </CustomFormGroup>
        <CustomFormGroup label="RiskAssessment Status">
          <FormControl {...formProps} name="status" type="text" defaultValue={assessmentDetail?.status} />
        </CustomFormGroup>
      </>
    );
  };

  render() {
    return <CommonForm {...this.props} name="name" renderContent={this.renderContent} generateDoc={this.props.generateDoc} object={this.props.object} />;
  }
}

export default Form;
