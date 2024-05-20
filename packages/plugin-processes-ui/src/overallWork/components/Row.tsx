import _ from "lodash";
import React from "react";
import { FinanceAmount } from "../../styles";
import { IOverallWork } from "../types";
import queryString from "query-string";
import { useNavigate } from "react-router-dom";

type Props = {
  work: IOverallWork;
  queryParams: any;
};

const OverallWorkRow = (props: Props) => {
  const navigate = useNavigate();

  const displayLocInfo = (obj) => {
    if (!obj) {
      return "";
    }
    return `${obj.code} - ${obj.title}`;
  };

  const displayWithNameInfo = (obj) => {
    if (!obj) {
      return "";
    }
    return `${obj.code} - ${obj.name}`;
  };
  const displayValue = (work, name) => {
    const value = _.get(work, name);
    return <FinanceAmount>{(value || 0).toLocaleString()}</FinanceAmount>;
  };

  const { work, queryParams } = props;
  const onTrClick = () => {
    let typeFilter: any = { jobReferId: work.key.typeId };
    if (!["job", "end"].includes(work.type)) {
      typeFilter = { productIds: [work.key.typeId] };
    }
    work.type = navigate(
      `/processes/overallWorkDetail?${queryString.stringify({
        ...queryParams,
        ...work.key,
        ...typeFilter,
      })}`
    );
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  return (
    <tr onClick={onTrClick} key={Math.random()}>
      <td>{work.type}</td>
      <td>{displayWithNameInfo(work.jobRefer)}</td>
      <td>{displayWithNameInfo(work.product)}</td>
      <td key={"receivableAmount"}>{displayValue(work, "count")}</td>
      <td>{displayLocInfo(work.inBranch)}</td>
      <td>{displayLocInfo(work.inDepartment)}</td>
      <td>{displayLocInfo(work.outBranch)}</td>
      <td>{displayLocInfo(work.outDepartment)}</td>
      <td key={"actions"} onClick={onClick}></td>
    </tr>
  );
};

export default OverallWorkRow;
