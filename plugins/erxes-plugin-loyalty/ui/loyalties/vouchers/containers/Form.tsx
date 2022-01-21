import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps, ButtonMutate } from 'erxes-ui';
import { IButtonMutateProps, IQueryParams } from 'erxes-ui/lib/types';
import React from 'react';
import { graphql } from 'react-apollo';
import Form from '../components/Form';
import { mutations, queries } from '../graphql';
import { queries as compaignQueries } from '../../../configs/voucherCompaign/graphql';
import { IVoucher } from '../types';
import { UsersQueryResponse } from 'erxes-ui/lib/auth/types';
import { IUser } from 'erxes-ui/lib/auth/types';
import { VoucherCompaignQueryResponse } from '../../../configs/voucherCompaign/types';

type Props = {
  voucher: IVoucher;
  getAssociatedVoucher?: (voucherId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
  voucherCompaignsQuery: VoucherCompaignQueryResponse;
} & Props & IQueryParams;

class VoucherFromContainer extends React.Component<FinalProps> {
  render() {
    const { voucherCompaignsQuery } = this.props;

    if (voucherCompaignsQuery.loading) {
      return null;
    }

    const renderButton = ({
      name,
      values,
      isSubmitted,
      object
    }: IButtonMutateProps) => {
      const { closeModal, getAssociatedVoucher } = this.props;

      const afterSave = data => {
        closeModal();

        if (getAssociatedVoucher) {
          getAssociatedVoucher(data.vouchersAdd);
        }
      };

      return (
        <ButtonMutate
          mutation={object ? mutations.vouchersEdit : mutations.vouchersAdd}
          variables={values}
          callback={afterSave}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully ${object ? 'updated' : 'added'
            } a ${name}`}
        />
      );
    };

    const compaigns = voucherCompaignsQuery.voucherCompaigns || [];

    const updatedProps = {
      ...this.props,
      renderButton,
      compaigns
    };
    return <Form {...updatedProps} />;
  }
}

const getRefetchQueries = () => {
  return [
    'vouchersMain',
    'voucherDetail',
    // vouchers for customer detail voucher associate
    'vouchers',
    'voucherCounts',
    'voucherCompaigns',
    'voucherCompaignsTotalCount'
  ];
};

const getOptions = (props) => {
  const { voucher } = props;
  if (voucher && voucher.compaignId) {
    return {
      variables: {
        equalTypeCompaignId: voucher.compaignId,
        fetchPolicy: 'network-only'
      }
    }
  }
  return {
    variables: {
      fetchPolicy: 'network-only'
    }
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, VoucherCompaignQueryResponse>(gql(compaignQueries.voucherCompaigns), {
      name: 'voucherCompaignsQuery',
      options: (props) => getOptions(props),
    })
  )(VoucherFromContainer)
);
