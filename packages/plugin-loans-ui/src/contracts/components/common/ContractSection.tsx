import {
  DealContractQueryResponse,
  EditMutationResponse,
  IContract,
  IContractDoc,
} from "../../types";
import { mutations, queries } from "../../graphql";
import { useMutation, useQuery } from "@apollo/client";

import Alert from "@erxes/ui/src/utils/Alert";
import Box from "@erxes/ui/src/components/Box";
import { MainStyleButtonRelated as ButtonRelated } from "@erxes/ui/src/styles/eindex";
import ContractChooser from "../../containers/ContractChooser";
import DynamicComponentContent from "@erxes/ui/src/components/dynamicComponent/Content";
import { IUser } from "@erxes/ui/src/auth/types";
import Icon from "@erxes/ui/src/components/Icon";
import { Link } from "react-router-dom";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import React from "react";
import { SectionBodyItem } from "@erxes/ui/src/layout/styles";
import { __ } from "coreui/utils";
import { can } from "@erxes/ui/src/utils/core";
import { gql } from "@apollo/client";
import withConsumer from "../../../withConsumer";
import Spinner from '@erxes/ui/src/components/Spinner';
import SchedulesList from "../schedules/SchedulesList";

type Props = {
  name: string;
  mainType?: string;
  mainTypeId?: string;
  showType?: string;
  id?: string;
  onSelect?: (contract: IContract[]) => void;
  collapseCallback?: () => void;
  title?: string;
  currentUser: IUser;
  object: any
};

function Component({
  name,
  mainType = "",
  mainTypeId = "",
  id = "",
  collapseCallback,
  title,
  currentUser,
  showType,
}: Props) {
  const contractsQuery = useQuery<DealContractQueryResponse>(
    gql(queries.dealContract),
    {
      fetchPolicy: "network-only",
      variables:
        { dealId: mainTypeId }
    }
  );

  const [contractsDealEdit] = useMutation<EditMutationResponse>(
    gql(mutations.contractsDealEdit),
    { refetchQueries: ["contractsMain"] }
  );

  if (contractsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const contract = contractsQuery?.data?.dealLoanContract?.contract;

  if (!contract) {
    return (<div>
      {contractsQuery?.error?.message || 'Not calced'}
    </div>)
  }

  const renderContractChooser = (props) => {
    return (
      <ContractChooser
        {...props}
        data={{
          name,
          contracts: [contract],
          mainType,
          mainTypeId: mainTypeId || id,
        }}
        onSelect={(contracts: IContractDoc[]) => {
          contractsDealEdit({
            variables: { _id: (contracts[0] || {})._id, dealId: mainTypeId },
          })
            .then(() => {
              collapseCallback && collapseCallback();
            })
            .catch((e) => {
              Alert.error(e.message);
            });
        }}
      />
    );
  };

  const contractTrigger = (
    <ButtonRelated>
      <span>{__("Apply contract")}</span>
    </ButtonRelated>
  );

  const quickButtons = can("contractsDealEdit", currentUser) && (
    <ModalTrigger
      title={__("Associate")}
      trigger={contractTrigger}
      size="lg"
      content={renderContractChooser}
    />
  );

  const firstSchedules = contractsQuery?.data?.dealLoanContract?.firstSchedules || [];
  const years = firstSchedules.map(fs => new Date(fs.payDate).getFullYear());
  const uniqueYears = [...new Set(years)];
  const scheduleYears = uniqueYears.map(item => ({ year: item }));

  const content = (
    <>
      <SectionBodyItem>
        {contract._id !== 'tempFakeContract' &&
          (
            <Link to={`/erxes-plugin-loan/contract-details/${contractsQuery?.data?.dealLoanContract?.contract._id}`}>
              <Icon icon="arrow-to-right" style={{ marginRight: 5 }} />
              <span>{contractsQuery?.data?.dealLoanContract?.contract.number || "Unknown"}</span>
            </Link>
          )
        }

        {contract._id === 'tempFakeContract' &&
          (<SchedulesList
            contractId={contract._id}
            schedules={firstSchedules}
            loading={false}
            scheduleYears={scheduleYears}
            currentYear={new Date().getFullYear()}
            onClickYear={() => { }}
          ></SchedulesList>)
        }

      </SectionBodyItem>
      {contract._id === 'tempFakeContract' && quickButtons}
    </>
  );

  if (showType && showType === "list") {
    return <DynamicComponentContent>{content}</DynamicComponentContent>;
  }

  return (
    <Box
      title={__(`${title || "Loan Contracts"}`)}
      name="showContracts"
      extraButtons={quickButtons}
      isOpen={true}
      callback={collapseCallback}
    >
      {content}
    </Box>
  );
}

export default withConsumer(Component);
