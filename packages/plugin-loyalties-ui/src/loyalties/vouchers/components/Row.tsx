import { ModalTrigger, TextInfo } from "@erxes/ui/src/components";
import { IQueryParams } from "@erxes/ui/src/types";
import { formatValue } from "@erxes/ui/src/utils/core";
import * as dayjs from "dayjs";
import React from "react";
import { Link } from "react-router-dom";
import { IVoucherCampaign } from "../../../configs/voucherCampaign/types";
import { STATUS_MODE } from "../../coupons/constants";
import Form from "../containers/Form";
import { IVoucher } from "../types";

type Props = {
  voucher: IVoucher;
  currentCampaign?: IVoucherCampaign;
  queryParams: IQueryParams;
};

const Row = (props: Props) => {
  const { voucher } = props;

  const OWNER_DETAILS = {
    customer: `/contacts/details/${voucher.ownerId}`,
    user: `/settings/team/details/${voucher.ownerId}`,
    company: `/companies/details/${voucher.ownerId}`,
    cpUser: `/settings/client-portal/users/details/${voucher.ownerId}`,
  };

  const renderOwner = (type, owner) => {
    if (!owner || !type) {
      return "-";
    }

    const ownerInfo =
      {
        customer: [
          owner?.primaryEmail,
          `${owner?.firstName ?? ""} ${owner?.lastName ?? ""}`.trim(),
          owner?.phones?.find((p) => p.type === "primary")?.phone,
        ],
        user: [
          owner?.email,
          owner?.details?.fullName,
          owner?.primaryPhone,
          owner?.details?.operatorPhone,
        ],
        company: [owner?.primaryEmail, owner?.primaryName, owner?.phones?.[0]],
        cpUser: [
          owner?.email,
          owner?.username,
          `${owner?.firstName ?? ""} ${owner?.lastName ?? ""}`.trim(),
          owner?.phone,
        ],
      }[type]?.find((value) => value) || "-";

    return <Link to={OWNER_DETAILS[type]}>{formatValue(ownerInfo)}</Link>;
  };

  const modalContent = (props) => {
    const updatedProps = {
      ...props,
      voucher,
    };

    return <Form {...updatedProps} />;
  };

  const trigger = (
    <tr key={voucher._id}>
      <td>{dayjs(voucher.createdAt).format("YYYY/MM/DD LT") || "-"}</td>
      <td>{voucher.ownerType}</td>
      <td>{renderOwner(voucher.ownerType, voucher.owner)}</td>
      <td>
        <TextInfo $textStyle={STATUS_MODE[voucher.status]}>
          {voucher.status || "-"}
        </TextInfo>
      </td>
    </tr>
  );

  return (
    <ModalTrigger
      title={`Edit voucher`}
      trigger={trigger}
      autoOpenKey="showProductModal"
      content={modalContent}
    />
  );
};

export default Row;
