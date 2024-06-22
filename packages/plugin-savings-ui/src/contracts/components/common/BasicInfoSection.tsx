import { Action, Name } from "../../styles";
import {
  Alert,
  Button,
  DropdownToggle,
  Icon,
  MainStyleInfoWrapper as InfoWrapper,
  ModalTrigger,
  Sidebar,
  confirm,
} from "@erxes/ui/src";
import React, { useState } from "react";
import { can, isEnabled } from "@erxes/ui/src/utils/core";

import BlockForm from "../../containers/detail/BlockForm";
import CloseForm from "../../containers/detail/CloseForm";
import ContractForm from "../../containers/ContractForm";
import DetailInfo from "./DetailInfo";
import Dropdown from "@erxes/ui/src/components/Dropdown";
import { IContract } from "../../types";
import { IUser } from "@erxes/ui/src/auth/types";
import InterestChange from "../../containers/detail/InterestChange";
import { __ } from "coreui/utils";
import client from "@erxes/ui/src/apolloClient";
import { getEnv } from "@erxes/ui/src/utils";
import { gql } from "@apollo/client";
import { queries } from "../../graphql";
import withConsumer from "../../../withConsumer";

type Props = {
  contract: IContract;
  currentUser: IUser;
  remove: () => void;
};

const BasicInfoSection = (props: Props) => {
  const [documents, setDocuments] = useState([] as any);
  const [loading, setLoading] = useState(false);
  const { remove, contract, currentUser } = props;

  const renderAction = () => {
    const onDelete = () =>
      confirm()
        .then(() => remove())
        .catch((error) => {
          Alert.error(error.message);
        });

    const onOpen = () => {
      if (!isEnabled("documents")) return;
      setLoading(true);
      client
        .mutate({
          mutation: gql(queries.documents),
          variables: { contentType: "savings" },
        })
        .then(({ data }) => {
          setDocuments(data.documents);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    };

    const onPrint = (mur) => {
      window.open(
        `${getEnv().REACT_APP_API_URL}/pl:documents/print?_id=${
          mur._id
        }&contractId=${contract?._id}`
      );
    };

    const closeForm = (props) => <CloseForm {...props} contract={contract} />;

    const interestChangeForm = (props) => (
      <InterestChange {...props} contract={contract} />
    );

    const contractForm = (props) => (
      <ContractForm change {...props} contract={contract} />
    );

    const menuItems = [
      can("contractsClose", currentUser) && {
        title: "To Close Contract",
        trigger: <a href="#toClose">{__("To Close Contract")}</a>,
        content: closeForm,
        additionalModalProps: { size: "lg" },
      },
      {
        title: "Interest correction",
        trigger: <a href="#toClose">{__("Interest correction")}</a>,
        content: interestChangeForm,
        additionalModalProps: { size: "lg" },
      },
      {
        title: "Change Contract",
        trigger: <a href="#toClose">{__("Change Contract")}</a>,
        content: contractForm,
        additionalModalProps: { size: "lg" },
      },
    ];

    return (
      <Action>
        <Dropdown
          // onToggle={(isShown) => isShown && onOpen()}
          as={DropdownToggle}
          toggleComponent={
            <Button btnStyle="simple" size="medium">
              {__("Action")}
              <Icon icon="angle-down" />
            </Button>
          }
          modalMenuItems={menuItems}
        >
          {documents?.map((mur) => {
            return (
              <li key={mur._id}>
                <a href="#print" onClick={() => onPrint(mur)}>
                  {__("Print") + " " + mur.name}
                </a>
              </li>
            );
          })}
          {can("contractsRemove", currentUser) && (
            <li>
              <a href="#delete" onClick={onDelete}>
                {__("Delete")}
              </a>
            </li>
          )}
        </Dropdown>
      </Action>
    );
  };

  const { Section } = Sidebar;

  const contractForm = (props) => (
    <ContractForm {...props} contract={contract} />
  );

  return (
    <Sidebar.Section>
      <InfoWrapper>
        <Name>{contract.number}</Name>
        {can("contractsEdit", currentUser) && (
          <ModalTrigger
            title={__("Edit basic info")}
            trigger={<Icon icon="edit" />}
            size="xl"
            content={contractForm}
          />
        )}
      </InfoWrapper>

      {renderAction()}

      <Section>
        <DetailInfo contract={contract} />
      </Section>
    </Sidebar.Section>
  );
};

export default withConsumer(BasicInfoSection);
