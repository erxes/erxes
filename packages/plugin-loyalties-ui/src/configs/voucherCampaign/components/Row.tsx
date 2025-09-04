import {
  FormControl,
  ModalTrigger,
  TextInfo,
  Toggle,
} from "@erxes/ui/src/components";
import ActionButtons from "@erxes/ui/src/components/ActionButtons";
import Button from "@erxes/ui/src/components/Button";
import * as dayjs from "dayjs";
import React from "react";
import { Link } from "react-router-dom";
import { VOUCHER_TYPES } from "../../../constants";
import Form from "../containers/Form";
import { IVoucherCampaign } from "../types";
// @ts-ignore
import WithPermission from "coreui/withPermission";

type Props = {
  voucherCampaign: IVoucherCampaign;
  isChecked: boolean;
  toggleBulk: (voucherCampaign: IVoucherCampaign, isChecked?: boolean) => void;
  handleStatus: () => void;
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
    const { voucherCampaign, toggleBulk, isChecked, handleStatus } = this.props;

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
        <td>{dayjs(startDate).format("YYYY-MM-DD")}</td>
        <td>{dayjs(endDate).format("YYYY-MM-DD")}</td>
        <td>{dayjs(finishDateOfUse).format("YYYY-MM-DD")}</td>
        <td>{(VOUCHER_TYPES[voucherType] || {}).label}</td>
        <td onClick={onClick}>
          <WithPermission
            action="manageLoyalties"
            fallbackComponent={<TextInfo>{status}</TextInfo>}
          >
            <Toggle checked={status === "active"} onChange={handleStatus} />
          </WithPermission>
        </td>
        <td onClick={onClick}>
          <ActionButtons>
            <Link to={`/vouchers?campaignId=${_id}`}>
              <Button btnStyle="link" icon="list-2" />
            </Link>
          </ActionButtons>
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
