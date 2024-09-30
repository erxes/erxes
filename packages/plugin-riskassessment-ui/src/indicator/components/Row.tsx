import { Button, FormControl, Icon, Label, Tip } from "@erxes/ui/src";

import { FormContainer } from "../../styles";
import React from "react";
import { RiskIndicatorsType } from "../common/types";
import { isEnabled } from "@erxes/ui/src/utils/core";
import moment from "moment";
import { useNavigate } from "react-router-dom";

type IProps = {
  indicator: RiskIndicatorsType;
  selectedItems: string[];
  onChange: (id: string) => void;
  queryParams: any;
  handleDuplicate: (_id: string) => void;
};

const generateDate = (value, formatted?) => {
  if (formatted) {
    return value ? moment(value).format("MM/DD/YYYY HH:mm") : "-";
  }
  return value ? moment(value).fromNow() : "-";
};

const TableRow = (props: IProps) => {
  const navigate = useNavigate();

  const renderActions = () => {
    const { handleDuplicate, indicator } = props;

    return (
      <Button
        btnStyle="link"
        style={{ padding: "5px" }}
        onClick={handleDuplicate.bind(this, indicator._id)}
      >
        <Tip text="Duplicate this risk indicator" placement="bottom">
          <Icon icon="copy" />
        </Tip>
      </Button>
    );
  };

  const { indicator, selectedItems, onChange } = props;

  const { _id, name, modifiedAt, createdAt, tags } = indicator;

  const onclick = e => {
    e.stopPropagation();
  };

  return (
    <tr
      key={_id}
      onClick={() => navigate(`/settings/risk-indicators/detail/${_id}`)}
    >
      <td onClick={onclick}>
        <FormControl
          componentclass="checkbox"
          checked={selectedItems.includes(_id)}
          onChange={() => onChange(_id)}
        />
      </td>
      <td>{name}</td>

      <td>
        <FormContainer $gapBetween={5} $row $maxItemsRow={3}>
          {(tags || []).map(tag => (
            <Label key={tag._id} lblColor={tag.colorCode}>
              {tag.name}
            </Label>
          ))}
        </FormContainer>
      </td>

      <td>
        <Tip text={generateDate(createdAt, true)} placement="bottom">
          {generateDate(createdAt)}{" "}
        </Tip>
      </td>

      <td>
        <Tip text={generateDate(modifiedAt, true)} placement="bottom">
          {generateDate(modifiedAt)}
        </Tip>
      </td>
      <td onClick={onclick}>{renderActions()}</td>
    </tr>
  );
};

export default TableRow;
