import {
  FormControl,
  Icon,
  ModalTrigger,
  TextInfo,
} from "@erxes/ui/src/components";

import Form from "../containers/Form";
import { IVoucherCampaign } from "../types";
import { Link } from "react-router-dom";
import React from "react";
import { VOUCHER_TYPES } from "../../../constants";

type Props = {
  voucherCampaign: IVoucherCampaign;
  isChecked: boolean;
  toggleBulk: (voucherCampaign: IVoucherCampaign, isChecked?: boolean) => void;
};

class Row extends React.Component<Props> {
  modalContent = (props) => {
    const { voucherCampaign } = this.props;

    const updatedProps = {
      ...props,
      voucherCampaign,
    };

    return <Form {...updatedProps} />;
  };

  render() {
    const { voucherCampaign, toggleBulk, isChecked } = this.props;

    const onChange = (e) => {
      if (toggleBulk) {
        toggleBulk(voucherCampaign, e.target.checked);
      }
    };

    const onClick = (e) => {
      e.stopPropagation();
    };

    const {
      _id,
      title,
      voucherType,
      startDate,
      endDate,
      finishDateOfUse,
      status,
    } = voucherCampaign;

    const trigger = (
      <tr key={_id}>
        <td onClick={onClick}>
          <FormControl
            checked={isChecked}
            componentclass="checkbox"
            onChange={onChange}
          />
        </td>
        <td>{title}</td>
        <td>{new Date(startDate).toLocaleDateString()}</td>
        <td>{new Date(endDate).toLocaleDateString()}</td>
        <td>{new Date(finishDateOfUse).toLocaleDateString()}</td>
        <td>{(VOUCHER_TYPES[voucherType] || {}).label}</td>
        <td>
          <TextInfo>{status}</TextInfo>
        </td>
        <td onClick={onClick}>
          <Link to={`/vouchers?campaignId=${_id}`}>
            <Icon icon="list-2" />
          </Link>
        </td>
      </tr>
    );

    return (
      <ModalTrigger
        size={"lg"}
        title="Edit voucher campaign"
        trigger={trigger}
        autoOpenKey="showProductModal"
        content={this.modalContent}
      />
    );
  }
}

export default Row;
