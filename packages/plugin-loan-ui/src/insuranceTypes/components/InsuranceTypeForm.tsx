import * as path from 'path';

import {
  Button,
  ControlLabel,
  Form,
  MainStyleFormColumn as FormColumn,
  FormControl,
  FormGroup,
  MainStyleFormWrapper as FormWrapper,
  MainStyleModalFooter as ModalFooter,
  MainStyleScrollWrapper as ScrollWrapper
} from '@erxes/ui/src';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { IInsuranceType, IInsuranceTypeDoc } from '../types';

import React from 'react';
import { __ } from 'coreui/utils';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { isEnabled } from '@erxes/ui/src/utils/core';

const SelectCompanies = asyncComponent(
  () =>
    isEnabled('contacts') &&
    path.resolve(
      /* webpackChunkName: "SelectCompanies" */ '@erxes/ui-contacts/src/companies/containers/SelectCompanies'
    )
);

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  insuranceType: IInsuranceType;
  closeModal: () => void;
};

type State = {
  name: string;
  companyId: string;
  description;
};

class InsuranceTypeForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    const { insuranceType = {} } = props;

    this.state = {
      name: insuranceType.name || '',
      description: insuranceType.description || '',
      companyId: insuranceType.companyId || ''
    };
  }

  generateDoc = (values: { _id: string } & IInsuranceTypeDoc) => {
    const { insuranceType } = this.props;
    const { companyId } = this.state;

    const finalValues = values;

    if (insuranceType) {
      finalValues._id = insuranceType._id;
    }

    return {
      _id: finalValues._id,
      ...this.state,
      code: finalValues.code,
      name: finalValues.name,
      percent: Number(finalValues.percent),
      description: finalValues.description,
      companyId,
      yearPercents: finalValues.yearPercents
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

  renderContent = (formProps: IFormProps) => {
    const insuranceType = this.props.insuranceType || ({} as IInsuranceType);
    const { closeModal, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    const { companyId } = this.state;

    const onSelectCompany = value => {
      this.setState({ companyId: value });
    };

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              {this.renderFormGroup('Code', {
                ...formProps,
                name: 'code',
                defaultValue: insuranceType.code || ''
              })}
              {this.renderFormGroup('Name', {
                ...formProps,
                name: 'name',
                defaultValue: insuranceType.name || ''
              })}

              {isEnabled('contacts') && (
                <FormGroup>
                  <ControlLabel>Company</ControlLabel>
                  <SelectCompanies
                    label="Choose an company"
                    name="companyId"
                    initialValue={companyId}
                    onSelect={onSelectCompany}
                    multi={false}
                  />
                </FormGroup>
              )}

              {this.renderFormGroup('Percent', {
                ...formProps,
                name: 'percent',
                type: 'number',
                defaultValue: insuranceType.percent || 0
              })}

              {this.renderFormGroup('years percents', {
                ...formProps,
                name: 'yearPercents',
                defaultValue: insuranceType.yearPercents || ''
              })}

              <FormGroup>
                <ControlLabel>Description</ControlLabel>
                <FormControl
                  {...formProps}
                  max={140}
                  name="description"
                  componentClass="textarea"
                  defaultValue={insuranceType.description || ''}
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
            name: 'insuranceType',
            values: this.generateDoc(values),
            isSubmitted,
            object: this.props.insuranceType
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default InsuranceTypeForm;
