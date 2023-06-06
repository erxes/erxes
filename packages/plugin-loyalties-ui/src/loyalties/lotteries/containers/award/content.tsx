import { Alert, Bulk, Spinner } from '@erxes/ui/src';
import client from '@erxes/ui/src/apolloClient';
import { IRouterProps } from '@erxes/ui/src/types';
import { router } from '@erxes/ui/src/utils';
import { withProps } from '@erxes/ui/src/utils/core';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import AwardContentComponent from '../../components/award/content';
import { mutations, queries } from '../../graphql';
import { lotteriesCampaignMain } from '../../graphql/queries';
import { MainQueryResponse } from '../../types';

type Props = { queryParams: any; nextChar: string };
type FinalProps = {
  lotteryCampaignWinnerList: any;
  lotteriesCampaignCustomerList: any;
  doLottery: any;
  getNextChar: any;
} & Props &
  IRouterProps;
class AwardContent extends React.Component<FinalProps, Props> {
  constructor(props) {
    super(props);

    this.state = {
      queryParams: '',
      nextChar: ''
    };

    this.doLotteries = this.doLotteries.bind(this);
    this.multipledoLottery = this.multipledoLottery.bind(this);
    this.getNextChar = this.getNextChar.bind(this);
  }

  doLotteries(variables: any) {
    this.props
      .doLottery({ variables })
      .then(() => {})
      .catch(error => {
        Alert.error(error.message);
      });
  }

  multipledoLottery(variables: any) {
    client
      .mutate({
        mutation: gql(mutations.multipledoLottery),
        variables: variables
      })
      .then(() => {
        setTimeout(() => {
          this.props.lotteriesCampaignCustomerList.refetch();
          this.props.lotteryCampaignWinnerList.refetch();
        }, 300);
      });
  }

  getNextChar(variables) {
    this.props.getNextChar({ variables }).then(res => {
      const { afterChars, nextChar, fitLotteriesCount } = res.data.getNextChar;
      this.setState({ nextChar: nextChar === '' ? nextChar : afterChars });
      if (afterChars.length === 6 && nextChar.length === 1) {
        if (fitLotteriesCount === 0) {
          Alert.error('No customer won');
        }
        if (fitLotteriesCount === 1) {
          Alert.success('Winner awarded');
        }
      }
    });
  }

  render() {
    const {
      lotteryCampaignWinnerList,
      lotteriesCampaignCustomerList
    } = this.props;

    if (
      lotteriesCampaignCustomerList.loading ||
      lotteryCampaignWinnerList.loading
    ) {
      return <Spinner objective={true} />;
    }

    const updatedProps = {
      ...this.props,
      doLotteries: this.doLotteries,
      multipledoLottery: this.multipledoLottery,
      getNextChar: this.getNextChar,
      nextChar: this.state.nextChar,
      winners: lotteryCampaignWinnerList.lotteryCampaignWinnerList?.list,
      winnersTotalCount:
        lotteryCampaignWinnerList.lotteryCampaignWinnerList?.totalCount,
      list: lotteriesCampaignCustomerList.lotteriesCampaignCustomerList?.list,
      totalCount:
        lotteriesCampaignCustomerList.lotteriesCampaignCustomerList?.totalCount
    };

    const content = props => {
      return <AwardContentComponent {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.lotteryCampaignWinnerList.refetch();
    };

    return <Bulk content={content} refetch={refetch} />;
  }
}
const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  ids: queryParams.ids,
  campaignId: queryParams.campaignId,
  awardId: queryParams.awardId,
  status: queryParams.status,
  ownerId: queryParams.ownerId,
  ownerType: queryParams.ownerType,
  searchValue: queryParams.searchValue,
  sortField: queryParams.sortField,
  sortDirection: Number(queryParams.sortDirection) || undefined,
  voucherCampaignId: queryParams.voucherCampaignId
});
export default withProps<Props>(
  compose(
    graphql<{ queryParams: any }>(gql(queries.lotteryCampaignWinnerList), {
      name: 'lotteryCampaignWinnerList',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams })
      })
    }),
    graphql<{ queryParams: any }, MainQueryResponse>(
      gql(lotteriesCampaignMain),
      {
        name: 'lotteriesCampaignCustomerList',
        options: ({ queryParams }) => ({
          variables: generateParams({ queryParams }),
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql(gql(mutations.doLotteries), {
      name: 'doLottery',
      options: {
        refetchQueries: [
          'lotteryCampaignWinnerList',
          'lotteriesCampaignCustomerList'
        ]
      }
    }),
    graphql(gql(mutations.getNextChar), {
      name: 'getNextChar'
    })
  )(AwardContent)
);
