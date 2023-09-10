import * as compose from 'lodash.flowright';
import Form from '../components/Form';
import React from 'react';
import { withProps } from '@erxes/ui/src/utils';
import { ButtonMutate } from '@erxes/ui/src/components';
import { IButtonMutateProps, IQueryParams } from '@erxes/ui/src/types';
import { ILottery } from '../types';
import { IUser } from '@erxes/ui/src/auth/types';
import { mutations } from '../graphql';
import { UsersQueryResponse } from '@erxes/ui/src/auth/types';

type Props = {
  lottery: ILottery;
  getAssociatedLottery?: (lotteryId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
  queryParams: IQueryParams;
} & Props;

class LotteryFromContainer extends React.Component<FinalProps> {
  render() {
    const renderButton = ({
      name,
      values,
      isSubmitted,
      object
    }: IButtonMutateProps) => {
      const { closeModal, getAssociatedLottery } = this.props;

      const afterSave = data => {
        closeModal();

        if (getAssociatedLottery) {
          getAssociatedLottery(data.lotteriesAdd);
        }
      };

      return (
        <ButtonMutate
          mutation={object ? mutations.lotteriesEdit : mutations.lotteriesAdd}
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
    'lotteriesMain',
    'lotteryDetail',
    // lotteries for customer detail lottery associate
    'lotteries',
    'lotteryCounts',
    'lotteryCampaigns',
    'lotteryCampaignsTotalCount'
  ];
};

export default withProps<Props>(compose()(LotteryFromContainer));
