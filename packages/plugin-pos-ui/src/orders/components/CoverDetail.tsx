import * as moment from "moment";

import {
  FieldStyle,
  SidebarCounter,
  SidebarList,
  Table,
  __,
} from "@erxes/ui/src";
import { FinanceAmount, FlexRow } from "../../styles";
import React, { useState } from "react";

import Button from "@erxes/ui/src/components/Button";
import FormControl from "@erxes/ui/src/components/form/Control";
import { ICover } from "../types";
import { ICustomer } from "@erxes/ui-contacts/src/customers/types";
import { IPos } from "../../types";
import _ from "lodash";

type Props = {
  onChangeNote: (_id: string, note: string) => void;
  cover: ICover;
  pos: IPos;
};

const CoverDetail = (props: Props) => {
  const { cover, onChangeNote } = props;

  const [note, setNote] = useState(cover.note || "");

  const displayValue = (cover, name) => {
    const value = _.get(cover, name);
    return <FinanceAmount>{(value || 0).toLocaleString()}</FinanceAmount>;
  };

  const renderRow = (label, value) => {
    return (
      <li>
        <FlexRow>
          <FieldStyle>{__(`${label}`)}:</FieldStyle>
          <SidebarCounter>{value || "-"}</SidebarCounter>
        </FlexRow>
      </li>
    );
  };

  const onChange = (e) => {
    const value = e.target.value;
    setNote(value);
  };

  const save = () => {
    const { note } = cover;

    onChangeNote(cover._id || "", note || "");
  };

  const generateLabel = (customer) => {
    const { firstName, primaryEmail, primaryPhone, lastName } =
      customer || ({} as ICustomer);

    let value = firstName ? firstName.toUpperCase() : "";

    if (lastName) {
      value = `${value} ${lastName}`;
    }
    if (primaryPhone) {
      value = `${value} (${primaryPhone})`;
    }
    if (primaryEmail) {
      value = `${value} /${primaryEmail}/`;
    }

    return value;
  };

  const renderDetail = (det) => {
    if (!det) {
      return "";
    }

    if (typeof det === "object") {
      return JSON.stringify(det);
    }

    return (det || "").toString();
  };

  return (
    <SidebarList>
      {renderRow(
        "Begin Date",
        moment(cover.beginDate).format("YYYY-MM-DD HH:mm")
      )}
      {renderRow("End Date", moment(cover.endDate).format("YYYY-MM-DD HH:mm"))}
      {renderRow("User", cover.user.email)}
      {renderRow("POS", cover.posName)}

      {renderRow("Total Amount", displayValue(cover, "totalAmount"))}

      {renderRow("Description", cover.description)}

      <Table $whiteSpace="nowrap" $bordered={true} $hover={true}>
        <thead>
          <tr>
            <th colSpan={3}>{__("Type")}</th>
            <th>{__("Summary")}</th>
            <th>{__("Detail")}</th>
          </tr>
        </thead>
        <tbody id="coverDetails">
          {(cover.details || []).map((detail) => (
            <>
              <tr key={detail._id}>
                <td colSpan={3}>{detail.paidType}</td>
                <td>
                  {(detail.paidSummary || []).reduce(
                    (sum, cur) => sum + cur.amount,
                    0
                  )}
                </td>
                <td>{renderDetail(detail.paidDetail)}</td>
              </tr>
              <tr key={`${detail._id}_head`}>
                <td></td>
                <td>kind</td>
                <td>kindOfVal</td>
                <td>Value</td>
                <td>amount</td>
              </tr>
              {(detail.paidSummary || []).map((s) => (
                <tr key={`${detail._id}_${s._id || Math.random()}`}>
                  <td></td>
                  <td>{s.kind}</td>
                  <td>{s.kindOfVal}</td>
                  <td>{s.value}</td>
                  <td>{s.amount}</td>
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </Table>

      <Button btnStyle="success" size="small" onClick={save} icon="edit">
        Save Note
      </Button>
    </SidebarList>
  );
};

export default CoverDetail;
