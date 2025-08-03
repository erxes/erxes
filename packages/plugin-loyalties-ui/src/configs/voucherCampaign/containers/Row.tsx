import { gql, useMutation } from "@apollo/client";
import React from "react";
import Row from "../components/Row";
import { mutations, queries } from "../graphql";
import { IVoucherCampaign } from "../types";

type Props = {
  voucherCampaign: IVoucherCampaign;
  isChecked: boolean;
  toggleBulk: (voucherCampaign: IVoucherCampaign, isChecked?: boolean) => void;
};

const RowContainer = (props: Props) => {
  const { voucherCampaign } = props;

  const [updateVoucherCampaign] = useMutation(
    gql(mutations.voucherCampaignsEdit),
    {
      refetchQueries: [
        {
          query: gql(queries.voucherCampaigns),
        },
      ],
    }
  );

  const handleStatus = () => {
    const { _id, status } = voucherCampaign;

    updateVoucherCampaign({
      variables: {
        _id,
        status: status === "active" ? "draft" : "active",
      },
    });
  };

  const updatedProps = {
    ...props,
    handleStatus,
  };

  return <Row {...updatedProps} />;
};

export default RowContainer;
