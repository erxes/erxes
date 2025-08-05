import { gql, useMutation } from "@apollo/client";
import React from "react";
import Row from "../components/Row";
import { mutations, queries } from "../graphql";
import { ICouponCampaign } from "../types";

type Props = {
  couponCampaign: ICouponCampaign;
  toggleBulk: (couponCampaign: ICouponCampaign, isChecked?: boolean) => void;
  isChecked: boolean;
};

const RowContainer = (props: Props) => {
  const { couponCampaign } = props;

  const [updateCouponCampaign] = useMutation(
    gql(mutations.couponCampaignEdit),
    {
      refetchQueries: [
        {
          query: gql(queries.couponCampaigns),
        },
      ],
    }
  );

  const handleStatus = () => {
    const { _id, status } = couponCampaign;

    updateCouponCampaign({
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
