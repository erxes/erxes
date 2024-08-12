import * as dayjs from "dayjs";

import Button from "@erxes/ui/src/components/Button";
import Detail from "../../containers/PosOrderDetail";
import { FormControl } from "@erxes/ui/src/components/form";
import ModalTrigger from "@erxes/ui/src/components/ModalTrigger";
import React from "react";
import Tip from "@erxes/ui/src/components/Tip";

type Props = {
  order: any;
  isChecked: boolean;
  isUnsynced: boolean;
  toggleBulk: (order: any, isChecked?: boolean) => void;
  toSend: (orderIds: string[]) => void;
  syncedInfo: any;
};

const Row = (props: Props) => {
  const {
    order,
    toggleBulk,
    isChecked,
    isUnsynced,
    syncedInfo,
    toSend,
  } = props;

  const modalContent = (_props) => {
    return <Detail order={order} />;
  };

  const onChange = (e) => {
    if (toggleBulk) {
      toggleBulk(order, e.target.checked);
    }
  };

  const onClick = (e) => {
    e.stopPropagation();
  };

  const onClickSend = (e) => {
    e.stopPropagation();
    toSend([order._id]);
  };

  const onTrClick = () => { };

  const { number, createdAt, totalAmount, paidDate } = order;

  const trigger = (
    <tr onClick={onTrClick}>
      <td onClick={onClick}>
        <FormControl
          checked={isChecked}
          componentclass="checkbox"
          onChange={onChange}
        />
      </td>
      <td>{number}</td>
      <td>{totalAmount.toLocaleString()}</td>
      <td>{dayjs(createdAt).format("lll")}</td>
      <td>{dayjs(paidDate).format("lll")}</td>
      <td>
        {syncedInfo?.syncedDate &&
          dayjs(syncedInfo?.syncedDate || "").format("ll")}
      </td>
      <td>{syncedInfo?.syncedBillNumber || ""}</td>
      <td>{syncedInfo?.syncedCustomer || ""}</td>
      <td>
        <Tip text="ReSend">
          <Button
            btnStyle="link"
            onClick={onClickSend}
            icon="sync-exclamation"
          />
        </Tip>

      </td>
    </tr>
  );

  return (
    <ModalTrigger
      title={`Order detail`}
      trigger={trigger}
      autoOpenKey="showProductModal"
      content={modalContent}
      size={"lg"}
    />
  );
};

export default Row;
