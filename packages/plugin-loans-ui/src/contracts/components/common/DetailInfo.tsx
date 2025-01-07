import { FieldStyle, SidebarCounter, SidebarList } from "@erxes/ui/src";

import { Description } from "../../styles";
import { IContract } from "../../types";
import React from "react";
import { WEEKENDS } from "../../../constants";
import { __ } from "coreui/utils";
import dayjs from "dayjs";

type Props = {
  contract: IContract;
};

const DetailInfo = (props: Props) => {
  const { contract } = props;

  const renderRow = (label, value) => {
    if (!value) {
      return <></>;
    }
    return (
      <li>
        <FieldStyle>{__(`${label}`)}</FieldStyle>
        <SidebarCounter>{value || "-"}</SidebarCounter>
      </li>
    );
  };

  const renderTeamMember = (label, field) => {
    if (!contract[field]) {
      return <></>;
    }
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
      {renderRow("Status", contract.status)}
      {renderRow("Classification", contract.classification)}
      {renderRow("Lease Type", contract.leaseType)}
      {renderRow(
        "Margin Amount",
        contract.marginAmount && contract.marginAmount.toLocaleString()
      )}
      {renderRow(
        "Lease Amount",
        contract.leaseAmount && contract.leaseAmount.toLocaleString()
      )}
      {renderRow(
        "Fee Amount",
        contract.feeAmount && contract.feeAmount.toLocaleString()
      )}
      {renderRow(
        "Stored Interest",
        contract.storedInterest && contract.storedInterest.toLocaleString()
      )}

      {renderRow(
        "Tenor (in months)",
        contract.tenor && contract.tenor.toLocaleString()
      )}
      {renderRow(
        "Interest Month",
        contract.interestRate && (contract.interestRate / 12).toLocaleString()
      )}
      {renderRow(
        "Interest Rate",
        contract.interestRate && contract.interestRate.toLocaleString()
      )}
      {contract.leaseType === "linear" &&
        renderRow(
          "Commitment interest",
          contract.commitmentInterest &&
          contract.commitmentInterest.toLocaleString()
        )}
      {renderRow("Loan Repayment", contract.repayment)}
      {renderRow("Start Date", dayjs(contract.startDate).format("YYYY/MM/DD"))}
      {renderRow("Schedule Days", contract.scheduleDays.join(","))}
      {renderRow("End Date", dayjs(contract.endDate).format("YYYY/MM/DD"))}
      {renderRow(
        "Loss Percent",
        contract.lossPercent && contract.lossPercent.toLocaleString()
      )}
      {renderRow("Loss calc type", contract.lossCalcType)}
      {renderRow("Debt Limit", contract.debt && contract.debt.toLocaleString())}
      {renderRow(
        "Insurance On Year",
        contract.insuranceAmount && contract.insuranceAmount.toLocaleString()
      )}

      {renderTeamMember("Relationship officer", "relationExpert")}
      {renderTeamMember("Leasing officer", "leasingExpert")}
      {renderTeamMember("Risk officer", "riskExpert")}
      <li>
        <FieldStyle>{__(`Weekends`)}</FieldStyle>
        <SidebarCounter>
          {(contract.weekends || []).map((week) => WEEKENDS[week]).join(", ")}
        </SidebarCounter>
      </li>
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
