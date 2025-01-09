import Box from "@erxes/ui/src/components/Box";
import ContractsCustomFields from "../list/ContractsCustomFields";
import DealSection from "./DealSection";
import { IContract } from "../../types";
import { List } from "../../styles";
import LoanContractSection from "./LoanContractSection";
import React from "react";
import Sidebar from "@erxes/ui/src/layout/components/Sidebar";
import { __ } from "coreui/utils";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import dayjs from "dayjs";
import { isEnabled } from "@erxes/ui/src/utils/core";

const CompanySection = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "CompanySection" */ "@erxes/ui-contacts/src/companies/components/CompanySection"
    )
);

const CustomerSection = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "CustomerSection" */ "@erxes/ui-contacts/src/customers/components/CustomerSection"
    )
);

type Props = {
  contract: IContract;
};

export default function RightSidebar(props: Props) {
  const renderPlan = contract => {
    if (!contract.plan) {
      return null;
    }

    return (
      <li>
        <div>{__("Plan")}: </div>
        <span>{contract.plan}</span>
      </li>
    );
  };

  const { contract } = props;

  return (
    <Sidebar>
      {
        <>
          {contract.customerType === "customer" && contract.customers && (
            <CustomerSection
              customers={[contract.customers]}
              title={__("Saving Primary Customers")}
              name={"Contract"}
            />
          )}
          {contract.customerType === "company" && (
            <CompanySection
              mainType="contract"
              mainTypeId={contract._id}
              title={__("Saving Primary Companies")}
              name={"Contract"}
            />
          )}
          <CustomerSection
            mainType="contractSub"
            mainTypeId={contract._id}
            title={__("Saving Collectively Customers")}
            name={"Contract"}
          />

          {isEnabled("sales") && <DealSection contract={contract} />}
        </>
      }
      {isEnabled("loans") && !!contract.loansOfForeclosed?.length && (
        <LoanContractSection loanContracts={contract.loansOfForeclosed} />
      )}
      {!!contract.loansOfForeclosed?.length && (
        <ContractsCustomFields
          contract={contract}
          collapseCallback={console.log}
          isDetail
        />
      )}

      <Box title={__("Other")} name="showOthers">
        <List>
          <li>
            <div>{__("Created at")}: </div>{" "}
            <span>{dayjs(contract.createdAt).format("lll")}</span>
          </li>
          {renderPlan(contract)}
        </List>
      </Box>
    </Sidebar>
  );
}
