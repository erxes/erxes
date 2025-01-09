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
} from "@erxes/ui/src";
import { IButtonMutateProps, IFormProps } from "@erxes/ui/src/types";
import { IInsuranceType, IInsuranceTypeDoc } from "../types";

import React, { useState } from "react";
import { __ } from "coreui/utils";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import { isEnabled } from "@erxes/ui/src/utils/core";

const SelectCompanies = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "SelectCompanies" */ "@erxes/ui-contacts/src/companies/containers/SelectCompanies"
    )
);

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  insuranceType: IInsuranceType;
  closeModal: () => void;
};

const InsuranceTypeForm = (props: Props) => {
  const { insuranceType = {} as IInsuranceType } = props;
  const [companyId, setCompanyId] = useState(insuranceType.companyId || "");

  const generateDoc = (values: { _id: string } & IInsuranceTypeDoc) => {
    const finalValues = values;

    if (insuranceType) {
      finalValues._id = insuranceType._id;
    }

    return {
      _id: finalValues._id,
      code: finalValues.code,
      name: finalValues.name,
      percent: Number(finalValues.percent),
      description: finalValues.description,
      companyId,
      yearPercents: finalValues.yearPercents
    };
  };

  const renderFormGroup = (label, props) => {
    return (
      <FormGroup>
        <ControlLabel required={props.required}>{__(label)}</ControlLabel>
        <FormControl {...props} />
      </FormGroup>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    const { closeModal, renderButton } = props;
    const { values, isSubmitted } = formProps;

    const onSelectCompany = value => {
      setCompanyId(value);
    };

    return (
      <>
        <ScrollWrapper>
          <FormWrapper>
            <FormColumn>
              {renderFormGroup("Code", {
                ...formProps,
                name: "code",
                required: true,
                defaultValue: insuranceType.code || ""
              })}
              {renderFormGroup("Name", {
                ...formProps,
                name: "name",
                required: true,
                defaultValue: insuranceType.name || ""
              })}

              <FormGroup>
                <ControlLabel required>{__("Company")}</ControlLabel>
                <SelectCompanies
                  label={__("Choose an company")}
                  name="companyId"
                  initialValue={companyId}
                  required
                  onSelect={onSelectCompany}
                  multi={false}
                />
              </FormGroup>

              {renderFormGroup("Percent", {
                ...formProps,
                name: "percent",
                type: "number",
                defaultValue: insuranceType.percent || 0
              })}

              {renderFormGroup("Year Percents", {
                ...formProps,
                name: "yearPercents",
                defaultValue: insuranceType.yearPercents || ""
              })}

              <FormGroup>
                <ControlLabel>{__("Description")}</ControlLabel>
                <FormControl
                  {...formProps}
                  max={140}
                  name="description"
                  componentclass="textarea"
                  defaultValue={insuranceType.description || ""}
                />
              </FormGroup>
            </FormColumn>
          </FormWrapper>
        </ScrollWrapper>

        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal} icon="cancel-1">
            {__("Close")}
          </Button>

          {renderButton({
            name: "insuranceType",
            values: generateDoc(values),
            isSubmitted,
            object: props.insuranceType
          })}
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default InsuranceTypeForm;
