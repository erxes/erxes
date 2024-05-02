import * as routerUtils from "@erxes/ui/src/utils/router";

import { FormControl, Icon, TextInfo } from "@erxes/ui/src/components";

import { IAssignmentCampaign } from "../types";
import { Link } from "react-router-dom";
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  assignmentCampaign: IAssignmentCampaign;
  isChecked: boolean;
  toggleBulk: (
    assignmentCampaign: IAssignmentCampaign,
    isChecked?: boolean
  ) => void;
};

const Row = (props: Props) => {
  const { assignmentCampaign, toggleBulk, isChecked } = props;
  const location = useLocation();
  const navigate = useNavigate();

  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(assignmentCampaign, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  const {
    _id,
    title,
    startDate,
    endDate,
    finishDateOfUse,
    status,
    segmentIds,
  } = assignmentCampaign;

  const onTrClick = (e: MouseEvent) => {
    e.preventDefault();

    navigate(
      `/erxes-plugin-loyalty/settings/assignment/edit?campaignId=${_id}`
    );

    if (segmentIds) {
      routerUtils.setParams(navigate, location, {
        segmentIds: JSON.stringify(segmentIds),
      });
    }
  };

  return (
    <tr key={_id} onClick={onTrClick}>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>{title}</td>
      <td>{new Date(startDate || "").toLocaleDateString()}</td>
      <td>{new Date(endDate || "").toLocaleDateString()}</td>
      <td>{new Date(finishDateOfUse || "").toLocaleDateString()}</td>
      <td>
        <TextInfo>{status}</TextInfo>
      </td>
      <td onClick={onClick}>
        <Link to={`/assignments?campaignId=${_id}`}>
          <Icon icon="list-2" />
        </Link>
      </td>
    </tr>
  );
};

export default Row;
