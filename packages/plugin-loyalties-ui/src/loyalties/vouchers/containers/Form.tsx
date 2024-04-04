import * as compose from 'lodash.flowright';
import Form from '../components/Form';
import React from 'react';
import { ButtonMutate } from '@erxes/ui/src/components';
import { withProps } from '@erxes/ui/src/utils';
import { IButtonMutateProps, IQueryParams } from '@erxes/ui/src/types';
import { IUser } from '@erxes/ui/src/auth/types';
import { IVoucher } from '../types';
import { mutations } from '../graphql';
import { UsersQueryResponse } from '@erxes/ui/src/auth/types';

type Props = {
  voucher: IVoucher;
  getAssociatedVoucher?: (voucherId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
  queryParams: IQueryParams;
} & Props;

class VoucherFromContainer extends React.Component<FinalProps> {
  render() {
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
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    const updatedProps = {
      ...this.props,
      renderButton
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
    'voucherCampaigns',
    'voucherCampaignsTotalCount'
  ];
};

export default withProps<Props>(compose()(VoucherFromContainer));
