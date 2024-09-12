import {
  Box,
  Button,
  FormGroup as CommonFormGroup,
  Sidebar as CommonSideBar,
  ControlLabel,
  DateControl,
  FormControl,
  Icon,
  Tip,
  Wrapper,
  __,
  router
} from "@erxes/ui/src";
import {
  ContainerBox,
  CustomRangeContainer,
  EndDateContainer
} from "../../../style";
import React, { useState } from "react";

import { DateContainer } from "@erxes/ui/src/styles/main";
import SelectBranches from "@erxes/ui/src/team/containers/SelectBranches";
import SelectCompanies from "@erxes/ui-contacts/src/companies/containers/SelectCompanies";
import SelectCustomers from "@erxes/ui-contacts/src/customers/containers/SelectCustomers";
import SelectDepartments from "@erxes/ui/src/team/containers/SelectDepartments";
import { SelectWithAssets } from "../../../common/utils";
import moment from "moment";

const { Section } = Wrapper.Sidebar;

type Props = {
  navigate: any;
  location: any;
  queryParams: any;
};

const fields = [
  "branchId",
  "departmentId",
  "teamMemberId",
  "companyId",
  "customerId",
  "assetId",
  "createdAtFrom",
  "createdAtTo"
];

const Sidebar = (props: Props) => {
  const { queryParams, navigate, location } = props;

  const handleSelect = (value, name) => {
    if (["createdAtFrom", "createdAtTo"].includes(name)) {
      value = moment(value).format(`YYYY/MM/DD hh:mm`);
    }

    // this.setState({ [name]: value });
    router.setParams(navigate, location, { [name]: value });
    router.setParams(navigate, location, { page: 1 });
  };

  const handleToggle = (value, name) => {
    value
      ? router.removeParams(navigate, location, name)
      : router.setParams(navigate, location, { [name]: !value });
  };

  const clearParams = field => {
    if (Array.isArray(field)) {
      field.forEach(name => {
        // this.setState({ [name]: undefined });
        return router.removeParams(navigate, location, name);
      });
    }
    // this.setState({ [field]: undefined });
    router.removeParams(navigate, location, field);
  };

  const FormGroup = ({
    label,
    field,
    clearable,
    children
  }: {
    label: string;
    field: string | string[];
    clearable?: boolean;
    children: React.ReactNode;
  }) => {
    return (
      <CommonFormGroup>
        <ContainerBox $row $spaceBetween>
          <ControlLabel>{label}</ControlLabel>
          {clearable && (
            <Button btnStyle="link" onClick={() => clearParams(field)}>
              <Tip placement="bottom" text="Clear">
                <Icon icon="cancel-1" />
              </Tip>
            </Button>
          )}
        </ContainerBox>
        {children}
      </CommonFormGroup>
    );
  };

  const extraButton = (
    <Button btnStyle="link" onClick={() => clearParams(fields)}>
      <Tip text="Clear filters" placement="bottom">
        <Icon icon="cancel-1" />
      </Tip>
    </Button>
  );

  return (
    <CommonSideBar>
      <Section.Title>
        {__("Addition Filters")}
        <Section.QuickButtons>
          {fields.some(field => queryParams[field]) && extraButton}
        </Section.QuickButtons>
      </Section.Title>
      <ContainerBox $vertical $column gap={5}>
        <FormGroup
          label="Branch"
          field="branchId"
          clearable={!!queryParams?.branchId}
        >
          <SelectBranches
            label="Choose Branch"
            name="branchId"
            multi={false}
            initialValue={queryParams?.branchId || ""}
            onSelect={handleSelect}
            customOption={{ value: "", label: "Choose Branch" }}
          />
        </FormGroup>
        <FormGroup
          label="Department"
          field="departmentId"
          clearable={!!queryParams?.departmentId}
        >
          <SelectDepartments
            label="Choose Department"
            name="departmentId"
            multi={false}
            initialValue={queryParams?.departmentId || ""}
            onSelect={handleSelect}
            customOption={{ value: "", label: "Choose Department" }}
          />
        </FormGroup>
        <FormGroup
          label="Team Member"
          field="teamMemberId"
          clearable={!!queryParams?.teamMemberId}
        >
          <SelectCompanies
            label="Choose Team Member"
            name="teamMemberId"
            multi={false}
            initialValue={queryParams?.teamMemberId || ""}
            onSelect={handleSelect}
            customOption={{ value: "", label: "Choose Team Member" }}
          />
        </FormGroup>
        <FormGroup
          label="Company"
          field="companyId"
          clearable={!!queryParams?.companyId}
        >
          <SelectCompanies
            label="Choose Company"
            name="companyId"
            multi={false}
            initialValue={queryParams?.companyId || ""}
            onSelect={handleSelect}
            customOption={{ value: "", label: "Choose Company" }}
          />
        </FormGroup>
        <FormGroup
          label="Customer"
          field="customerId"
          clearable={!!queryParams?.customerId}
        >
          <SelectCustomers
            label="Choose Customer"
            name="customerId"
            multi={false}
            initialValue={queryParams?.customerId || ""}
            onSelect={handleSelect}
            customOption={{ value: "", label: "Choose Customer" }}
          />
        </FormGroup>
        <FormGroup
          label="Asset"
          field="assetId"
          clearable={!!queryParams?.assetId}
        >
          <SelectWithAssets
            label="Choose Asset"
            name="assetId"
            multi={false}
            initialValue={queryParams?.assetId || ""}
            onSelect={handleSelect}
            customOption={{ value: "", label: "Choose Asset" }}
          />
        </FormGroup>
        <FormGroup
          label="Asset Parent"
          field="parentId"
          clearable={!!queryParams?.parentId}
        >
          <SelectWithAssets
            label="Choose Parent"
            name="parentId"
            multi={false}
            initialValue={queryParams?.parentId || ""}
            onSelect={handleSelect}
            customOption={{ value: "*", label: "Without Parent" }}
          />
        </FormGroup>
        <FormGroup
          label="Created Date Range"
          clearable={!!queryParams?.createdAtFrom || !!queryParams?.createdAtTo}
          field={["createdAtFrom", "createdAtTo"]}
        >
          <CustomRangeContainer>
            <DateContainer>
              <DateControl
                name="createdAtFrom"
                placeholder="Choose start date"
                value={queryParams?.createdAtFrom || ""}
                onChange={e => handleSelect(e, "createdAtFrom")}
              />
            </DateContainer>
            <EndDateContainer>
              <DateContainer>
                <DateControl
                  name="createdAtTo"
                  placeholder="Choose end date"
                  value={queryParams?.createdAtTo || ""}
                  onChange={e => handleSelect(e, "createdAtTo")}
                />
              </DateContainer>
            </EndDateContainer>
          </CustomRangeContainer>
        </FormGroup>
        <CommonFormGroup>
          <FormControl
            name="onlyCurrent"
            componentclass="checkbox"
            checked={!!queryParams.onlyCurrent}
            onChange={() =>
              handleToggle(queryParams.onlyCurrent, "onlyCurrent")
            }
          />
          <ControlLabel>{__("only last movement of per assets")}</ControlLabel>
        </CommonFormGroup>
      </ContainerBox>
    </CommonSideBar>
  );
};

export default Sidebar;
