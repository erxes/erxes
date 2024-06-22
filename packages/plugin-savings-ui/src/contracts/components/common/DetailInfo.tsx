import { FieldStyle, SidebarCounter, SidebarList } from "@erxes/ui/src";

import { Description } from "../../styles";
import { IContract } from "../../types";
import React from "react";
import { __ } from "coreui/utils";
import dayjs from "dayjs";

type Props = {
  contract: IContract;
};

const DetailInfo = (props: Props) => {
  const { contract } = props;

  const renderRow = (label, value) => {
    return (
      <li>
        <FieldStyle>{__(`${label}`)}</FieldStyle>
        <SidebarCounter>{value || "-"}</SidebarCounter>
      </li>
    );
  };

  const renderTeamMember = (label, field) => {
    return renderRow(
      label,
      contract[field]
        ? (contract[field].details && contract[field].details.fullName) ||
            contract[field].email
        : "-"
    );
  };

  return (
    <SidebarList className="no-link">
      {renderRow(
        "Contract Type",
        contract.contractType ? contract.contractType.name : ""
      )}
      {renderRow("Contract Number", contract.number)}
      {renderRow("Last name", contract.customers?.lastName)}
      {renderRow("First name", contract.customers?.firstName)}

      {renderRow("Status", contract.status)}
      {renderRow("Start Date", dayjs(contract.startDate).format("YYYY/MM/DD"))}
      {renderRow(
        "Tenor (in months)",
        (contract.duration || 0).toLocaleString()
      )}
      {renderRow("End Date", dayjs(contract.endDate).format("YYYY/MM/DD"))}

      {renderRow(
        "Interest Rate",
        (contract.interestRate || 0).toLocaleString()
      )}
      {renderRow(
        "Close interest Rate",
        (contract.closeInterestRate || 0).toLocaleString()
      )}
      {renderRow("Store interest interval", __(contract.storeInterestInterval))}

      {renderRow("Interest calc type", contract.interestCalcType)}

      {renderRow("Interest give type", __(contract.interestGiveType))}

      {renderRow("Close or extend of time", __(contract.closeOrExtendConfig))}

      {renderRow("Currency", contract.currency)}
      {renderRow(
        "Saving Amount",
        (contract.savingAmount || 0).toLocaleString()
      )}
      {renderRow("Block Amount", (contract.blockAmount || 0).toLocaleString())}
      {renderRow(
        "Saving stored interest",
        (contract.storedInterest || 0).toLocaleString()
      )}

      {renderTeamMember("Saving officer", "createdBy")}
      <li>
        <FieldStyle>{__(`Description`)}</FieldStyle>
      </li>
      <Description
        dangerouslySetInnerHTML={{
          __html: contract.description,
        }}
      />
    </SidebarList>
  );
};

export default DetailInfo;
