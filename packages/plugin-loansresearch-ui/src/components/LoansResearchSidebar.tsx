import { Button, Icon, ModalTrigger, __ } from "@erxes/ui/src";

import Box from "@erxes/ui/src/components/Box";
import DynamicComponentContent from "@erxes/ui/src/components/dynamicComponent/Content";
import EmptyState from "@erxes/ui/src/components/EmptyState";
import { ILoanResearch } from "../types";
import { List } from "../styles";
import LoansResearchFormContainer from "../containers/LoansResearchForm";
import React from "react";

type Props = {
  loansResearch: ILoanResearch;
  queryParams: any;
  showType?: string;
};

const LoansResearchSidebar = (props: Props) => {
  const { loansResearch, queryParams, showType } = props;

  const renderForm = ({
    closeModal,
  }: {
    closeModal: () => void;
  }): React.ReactNode => {
    return (
      <LoansResearchFormContainer
        loansResearch={loansResearch}
        queryParams={queryParams}
        closeModal={closeModal}
      />
    );
  };

  const extreBtnTrigger = (
    <Button btnStyle="link">
      <Icon icon="plus-circle" size={16} />
    </Button>
  );

  const extraButtons = (
    <ModalTrigger
      content={({ closeModal }) => renderForm({ closeModal })}
      title={`Add loans research`}
      trigger={extreBtnTrigger}
    />
  );

  const content = () => {
    if (!loansResearch) {
      return <EmptyState icon="building" text="No research" />;
    }

    return (
      <List>
        <li>
          <div>{__("Customer Type")}: </div>{" "}
          <span>{loansResearch?.customerType || ""}</span>
        </li>
        <li>
          <div>{__("Deal")}: </div> <span>{loansResearch?.dealId || ""}</span>
        </li>
      </List>
    );
  };

  if (showType && showType === "list") {
    return <DynamicComponentContent>{content()}</DynamicComponentContent>;
  }

  return (
    <Box
      title="Loans Research"
      name="loansResearch"
      isOpen={true}
      extraButtons={extraButtons}
    >
      {content()}
    </Box>
  );
};

export default LoansResearchSidebar;
