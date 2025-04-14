import { gql, useLazyQuery } from '@apollo/client';
import { ButtonMutate } from '@erxes/ui/src/components';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import { queries } from '../../../configs/couponCampaign/graphql';
import Form from '../components/Form';
import { mutations } from '../graphql';
import { ICoupon } from '../types';

type Props = {
  queryParams: any;
  coupon: ICoupon;
  closeModal: () => void;
};

const FormContainer = (props: Props) => {
  const [fetchCouponCampaignQuery, { loading, data }] = useLazyQuery(
    gql(queries.couponCampaign),
  );

  const renderButton = ({
    name,
    values,
    isSubmitted,
    object,
  }: IButtonMutateProps) => {
    const { closeModal } = props;

    const afterSave = () => {
      closeModal();
    };

    return (
      <ButtonMutate
        mutation={mutations.couponsAdd}
        variables={values}
        callback={afterSave}
        refetchQueries={['coupons']}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${name}`}
      />
    );
  };

  const fetchCouponCampaign = (campaignId) => {
    fetchCouponCampaignQuery({
      variables: {
        _id: campaignId,
      },
    });
  };

  const updatedProps = {
    ...props,
    selectedCouponCampaign: data?.couponCampaign || null,
    loadingCouponCampaign: loading || false,
    renderButton,
    fetchCouponCampaign,
  };
  return <Form {...updatedProps} />;
};

export default FormContainer;
