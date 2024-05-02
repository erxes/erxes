import {
  Alert,
  Button,
  confirm,
  DropdownToggle,
  FieldStyle,
  Icon,
  MainStyleInfoWrapper as InfoWrapper,
  ModalTrigger,
  Sidebar,
  SidebarCounter,
  SidebarList,
} from "@erxes/ui/src";
import { __ } from "coreui/utils";
import Dropdown from "@erxes/ui/src/components/Dropdown";
import { Action, Name } from "../../contracts/styles";
import React from "react";

import { Description } from "../../contracts/styles";
import ContractTypeForm from "../containers/ContractTypeForm";
import { IContractTypeDetail } from "../types";

type Props = {
  contractType: IContractTypeDetail;
  remove?: () => void;
};

const DetailInfo = (props: Props) => {
  const renderRow = (label, value) => {
    return (
      <li>
        <FieldStyle>{__(`${label}`)}</FieldStyle>
        <SidebarCounter>{value || "-"}</SidebarCounter>
      </li>
    );
  };

  const renderAction = () => {
    const { remove } = props;

    const onDelete = () =>
      confirm()
        .then(() => remove && remove())
        .catch((error) => {
          Alert.error(error.message);
        });

    return (
      <Action>
        <Dropdown
          as={DropdownToggle}
          toggleComponent={
            <Button btnStyle="simple" size="medium">
              {__("Action")}
              <Icon icon="angle-down" />
            </Button>
          }
        >
          <li>
            <a href="#delete" onClick={onDelete}>
              {__("Delete")}
            </a>
          </li>
        </Dropdown>
      </Action>
    );
  };

  const { contractType } = props;
  const { Section } = Sidebar;

  const content = (props) => (
    <ContractTypeForm {...props} contractType={contractType} />
  );

  return (
    <Sidebar wide={true}>
      <Sidebar.Section>
        <InfoWrapper>
          <Name>{contractType.name}</Name>
          <ModalTrigger
            title={__("Edit basic info")}
            trigger={<Icon icon="edit" />}
            size="lg"
            content={content}
          />
        </InfoWrapper>

        {renderAction()}

        <Section>
          <SidebarList className="no-link">
            {renderRow("Code", contractType.code)}
            {renderRow("Name", contractType.name || "")}
            {renderRow("Start Number", contractType.number || "")}
            {renderRow(
              "After vacancy count",
              (contractType.vacancy || 0).toLocaleString()
            )}

            {renderRow("Interest calc type", contractType.interestCalcType)}
            {renderRow(
              "Store interest interval",
              contractType.storeInterestInterval
            )}
            {renderRow("Is allow income", contractType.isAllowIncome)}
            {renderRow("Is allow outcome", contractType.isAllowOutcome)}
            <li>
              <FieldStyle>{__(`Description`)}</FieldStyle>
            </li>
            <Description
              dangerouslySetInnerHTML={{
                __html: contractType.description,
              }}
            />
          </SidebarList>
        </Section>
      </Sidebar.Section>
    </Sidebar>
  );
};

export default DetailInfo;
