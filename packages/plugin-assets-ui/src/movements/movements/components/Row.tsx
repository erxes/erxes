import { Button, FormControl, ModalTrigger, Tip } from "@erxes/ui/src";

import Form from "../containers/Form";
import { IMovementType } from "../../../common/types";
import { Link } from "react-router-dom";
import React from "react";
import moment from "moment";

type Props = {
  movement: IMovementType;
  navigate: any;
  isChecked: boolean;
  toggleBulk?: (
    movement: IMovementType,
    movementId: string,
    isChecked?: boolean
  ) => void;
  queryParams: any;
};

const Row = (props: Props) => {
  const { movement, isChecked, toggleBulk, navigate, queryParams } = props;

  const { createdAt, _id, user, movedAt, modifiedAt, description } = movement;

  const handleItems = () => {
    navigate(`/asset-movement-items?movementId=${_id}`);
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(movement, _id || "", e.target.checked);
    }
  };

  const renderRow = (
    <tr>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>
        <Link to={user ? `/settings/team/details/${user._id}` : "/"}>
          {user?.details?.fullName}
        </Link>
      </td>
      <td>{moment(movedAt || "").format("YYYY-MM-DD HH:mm")}</td>
      <td>{description}</td>
      <td>{moment(createdAt || "").format("YYYY-MM-DD HH:mm")}</td>
      <td>{moment(modifiedAt || "").format("YYYY-MM-DD HH:mm")}</td>
      <td>
        <Tip text="see movement assets">
          <Button btnStyle="link" icon="list-2" onClick={handleItems} />
        </Tip>
      </td>
    </tr>
  );

  const renderDetail = (props) => {
    const updatedProps = {
      ...props,
      movementId: _id,
      queryParams: queryParams,
    };

    return <Form {...updatedProps} />;
  };

  return (
    <ModalTrigger
      title="Edit Movement"
      content={renderDetail}
      trigger={renderRow}
      autoOpenKey="showListFormModal"
      dialogClassName="transform"
      size="xl"
    />
  );
};

export default Row;
