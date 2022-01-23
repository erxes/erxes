import * as compose from 'lodash.flowright';
import Form from '../components/Form';
import gql from 'graphql-tag';
import React from 'react';
import { ButtonMutate, withProps } from 'erxes-ui';
import { graphql } from 'react-apollo';
import { IButtonMutateProps, IQueryParams } from 'erxes-ui/lib/types';
import { ILottery } from '../types';
import { IUser } from 'erxes-ui/lib/auth/types';
import { LotteryCompaignQueryResponse } from '../../../configs/lotteryCompaign/types';
import { mutations } from '../graphql';
import { queries as compaignQueries } from '../../../configs/lotteryCompaign/graphql';
import { UsersQueryResponse } from 'erxes-ui/lib/auth/types';

type Props = {
  lottery: ILottery;
  getAssociatedLottery?: (lotteryId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
  lotteryCompaignsQuery: LotteryCompaignQueryResponse;
  queryParams: IQueryParams;
} & Props;

class LotteryFromContainer extends React.Component<FinalProps> {
  render() {
    const { lotteryCompaignsQuery } = this.props;

    if (lotteryCompaignsQuery.loading) {
      return null;
    }

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
          successMessage={`You successfully ${object ? 'updated' : 'added'
            } a ${name}`}
        />
      );
    };

    const compaigns = lotteryCompaignsQuery.lotteryCompaigns || [];

    const updatedProps = {
      ...this.props,
      renderButton,
      compaigns,
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
    'lotteryCompaigns',
    'lotteryCompaignsTotalCount'
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, LotteryCompaignQueryResponse>(gql(compaignQueries.lotteryCompaigns), {
      name: 'lotteryCompaignsQuery',
      options: {
        fetchPolicy: 'network-only'
      },
    })
  )(LotteryFromContainer)
);
