import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps, ButtonMutate } from 'erxes-ui';
import { IButtonMutateProps, IQueryParams } from 'erxes-ui/lib/types';
import React from 'react';
import { graphql } from 'react-apollo';
import Form from '../components/Form';
import { mutations, queries } from '../graphql';
import { queries as compaignQueries } from '../../../configs/donateCompaign/graphql';
import { IDonate } from '../types';
import { UsersQueryResponse } from 'erxes-ui/lib/auth/types';
import { IUser } from 'erxes-ui/lib/auth/types';
import { DonateCompaignQueryResponse } from '../../../configs/donateCompaign/types';

type Props = {
  donate: IDonate;
  getAssociatedDonate?: (donateId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
  donateCompaignsQuery: DonateCompaignQueryResponse;
  queryParams: IQueryParams;
} & Props;

class DonateFromContainer extends React.Component<FinalProps> {
  render() {
    const { donateCompaignsQuery } = this.props;

    if (donateCompaignsQuery.loading) {
      return null;
    }

    const renderButton = ({
      name,
      values,
      isSubmitted,
      object
    }: IButtonMutateProps) => {
      const { closeModal, getAssociatedDonate } = this.props;

      const afterSave = data => {
        closeModal();

        if (getAssociatedDonate) {
          getAssociatedDonate(data.donatesAdd);
        }
      };

      return (
        <ButtonMutate
          mutation={object ? mutations.donatesEdit : mutations.donatesAdd}
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

    const compaigns = donateCompaignsQuery.donateCompaigns || [];

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
    'donatesMain',
    'donateDetail',
    // donates for customer detail donate associate
    'donates',
    'donateCounts',
    'donateCompaigns',
    'donateCompaignsTotalCount'
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, DonateCompaignQueryResponse>(gql(compaignQueries.donateCompaigns), {
      name: 'donateCompaignsQuery',
      options: {
        fetchPolicy: 'network-only'
      },
    })
  )(DonateFromContainer)
);
