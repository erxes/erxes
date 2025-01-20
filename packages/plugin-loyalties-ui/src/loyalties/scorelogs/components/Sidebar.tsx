import {
  ClearBtnContainer,
  FilterRowContainer,
  PaddingTop,
} from "../../../styles";
import {
  ControlLabel,
  DateControl,
  FormControl,
  FormGroup,
  Icon,
  SelectTeamMembers,
  SelectWithSearch,
  Tip,
  Wrapper,
  router,
} from "@erxes/ui/src";
import { DateContainer, ScrollWrapper } from "@erxes/ui/src/styles/main";
import { useLocation, useNavigate } from "react-router-dom";

import React, { useState } from "react";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import { isEnabled } from "@erxes/ui/src/utils/core";

const SelectCompanies = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "SelectCompanies" */ "@erxes/ui-contacts/src/companies/containers/SelectCompanies"
    )
);

const SelectCustomers = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "SelectCustomers" */ "@erxes/ui-contacts/src/customers/containers/SelectCustomers"
    )
);

const campaignQuery = `
query ScoreCampaigns {
      scoreCampaigns {
        _id,title
      }
    }
`;

interface LayoutProps {
  children: React.ReactNode;
  label: string;
  clearable: boolean;
  type: string;
}
interface VObject {
  fromDate: string;
  toDate: string;
  orderType: string;
  order: string;
  ownerType: string;
  ownerId: string;
}

type Props = {
  loadingMainQuery: boolean;
  queryParams: any;
  refetch: (variable: any) => void;
};

const SideBar = (props: Props) => {
  const [variables, setVariables] = useState(props?.queryParams);
  const location = useLocation();
  const navigate = useNavigate();

  const { refetch } = props;

  const handleClear = (e: any, type: string) => {
    router.removeParams(navigate, location, type);
    variables[type] = "";
    refetch(variables);
    // setVariables(variables)
  };

  const handleValue = (e: any) => {
    const target = e.currentTarget as HTMLInputElement;
    const name = target.name;
    const value = target.value;
    const result = { ...variables, [name]: value };
    setVariables(result);
    router.setParams(navigate, location, { [name]: value });
    name !== "orderType" && refetch(result);
  };

  const handleDate = (e: any, type: string) => {
    const result = { ...variables, [type]: String(e) };
    setVariables(result);
    router.setParams(navigate, location, { [type]: String(e) });

    refetch(result);
  };

  const checkParams = type => {
    return router.getParam(location, type) ? true : false;
  };

  const handleOwnerId = e => {
    const result = { ...variables, ownerId: String(e) };
    setVariables(result);
    router.setParams(navigate, location, { ownerId: String(e) });
    refetch(result);
  };
  const renderOwner = () => {
    if (variables.ownerType === "customer") {
      return (
        <SelectCustomers
          label="Team Members"
          name="ownerId"
          multi={false}
          initialValue={variables?.ownerId}
          onSelect={handleOwnerId}
        />
      );
    }

    if (variables.ownerType === "user") {
      return (
        <SelectTeamMembers
          label="Team Members"
          name="ownerId"
          multi={false}
          initialValue={variables?.ownerId}
          onSelect={handleOwnerId}
        />
      );
    }

    return (
      <SelectCompanies
        label="Compnay"
        name="ownerId"
        multi={false}
        initialValue={variables?.ownerId}
        onSelect={handleOwnerId}
      />
    );
  };

  const Form = (props: LayoutProps) => (
    <FormGroup>
      <ControlLabel>{props.label}</ControlLabel>
      <FilterRowContainer>
        {props.children}
        {props.clearable && (
          <ClearBtnContainer
            tabIndex={0}
            onClick={e => handleClear(e, props.type)}
          >
            <Tip text={"Clear filter"} placement="bottom">
              <Icon icon="cancel-1" />
            </Tip>
          </ClearBtnContainer>
        )}
      </FilterRowContainer>
    </FormGroup>
  );

  const SideBarFilter = () => {
    return (
      <ScrollWrapper>
        <Wrapper.Sidebar.Section.Title>
          Addition filters
        </Wrapper.Sidebar.Section.Title>
        <Form
          label="Owner Type"
          clearable={checkParams("ownerType")}
          type="ownerType"
        >
          <FormControl
            name="ownerType"
            componentclass="select"
            value={variables?.ownerType}
            required={true}
            onChange={handleValue}
          >
            <option key={"customer"} value={"customer"}>
              {"customer"}
            </option>
            <option key={"user"} value={"user"}>
              {"user"}
            </option>
            <option key={"company"} value={"company"}>
              {"company"}
            </option>
          </FormControl>
        </Form>
        <Form label="Owner" clearable={checkParams("ownerId")} type="ownerId">
          {renderOwner()}
        </Form>
        <Form
          label="Order Type"
          clearable={checkParams("orderType")}
          type="orderType"
        >
          <FormControl
            name="orderType"
            componentclass="select"
            value={variables?.orderType}
            placeholder={"Select Order Type"}
            required={true}
            onChange={handleValue}
          >
            <option key={"Date"} value={"createdAt"}>
              {"Date"}
            </option>
            <option key={"Changed Score"} value={"changeScore"}>
              {"Changed Score"}
            </option>
          </FormControl>
        </Form>
        <Form
          label="Campaign"
          clearable={checkParams("campaignId")}
          type="campaignId"
        >
          <SelectWithSearch
            label={"Score Campaigns"}
            queryName="scoreCampaigns"
            name={"campaignId"}
            initialValue={variables?.campaignId}
            generateOptions={list =>
              list.map(({ _id, title }) => ({ value: _id, label: title }))
            }
            onSelect={value => {
              setVariables({ ...variables, campaignId: value });
              router.setParams(navigate, location, { campaignId: value });
            }}
            customQuery={campaignQuery}
          />
        </Form>
        <Form label="Order" clearable={checkParams("order")} type="order">
          <FormControl
            name="order"
            componentclass="select"
            value={variables?.order}
            placeholder={"Select Order"}
            required={true}
            onChange={handleValue}
            disabled={!variables?.orderType}
          >
            <option key={"Ascending"} value={1}>
              {"Ascending"}
            </option>
            <option key={"Descending"} value={-1}>
              {"Descending"}
            </option>
          </FormControl>
        </Form>
        <Form label="From" clearable={checkParams("fromDate")} type="fromDate">
          <DateContainer>
            <DateControl
              required={true}
              name="startDate"
              placeholder={"Choose start date"}
              value={variables?.fromDate}
              onChange={e => handleDate(e, "fromDate")}
            />
          </DateContainer>
        </Form>
        <Form label="To" clearable={checkParams("toDate")} type="toDate">
          <DateContainer>
            <DateControl
              required={true}
              name="fromDate"
              placeholder={"Choose from date"}
              value={variables?.toDate}
              onChange={e => handleDate(e, "toDate")}
            />
          </DateContainer>
        </Form>
      </ScrollWrapper>
    );
  };
  return (
    <Wrapper.Sidebar hasBorder>
      <PaddingTop>
        <SideBarFilter />
      </PaddingTop>
    </Wrapper.Sidebar>
  );
};

export default SideBar;
