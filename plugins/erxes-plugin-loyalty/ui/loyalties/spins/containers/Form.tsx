import * as compose from 'lodash.flowright';
import Form from '../components/Form';
import gql from 'graphql-tag';
import React from 'react';
import { ButtonMutate, withProps } from 'erxes-ui';
import { graphql } from 'react-apollo';
import { IButtonMutateProps, IQueryParams } from 'erxes-ui/lib/types';
import { ISpin } from '../types';
import { IUser } from 'erxes-ui/lib/auth/types';
import { mutations } from '../graphql';
import { queries as compaignQueries } from '../../../configs/spinCompaign/graphql';
import { SpinCompaignQueryResponse } from '../../../configs/spinCompaign/types';
import { UsersQueryResponse } from 'erxes-ui/lib/auth/types';

type Props = {
  spin: ISpin;
  getAssociatedSpin?: (spinId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
  spinCompaignsQuery: SpinCompaignQueryResponse;
  queryParams: IQueryParams;
} & Props;

class SpinFromContainer extends React.Component<FinalProps> {
  render() {
    const { spinCompaignsQuery } = this.props;

    if (spinCompaignsQuery.loading) {
      return null;
    }

    const renderButton = ({
      name,
      values,
      isSubmitted,
      object
    }: IButtonMutateProps) => {
      const { closeModal, getAssociatedSpin } = this.props;

      const afterSave = data => {
        closeModal();

        if (getAssociatedSpin) {
          getAssociatedSpin(data.spinsAdd);
        }
      };

      return (
        <ButtonMutate
          mutation={object ? mutations.spinsEdit : mutations.spinsAdd}
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

    const compaigns = spinCompaignsQuery.spinCompaigns || [];

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
    'spinsMain',
    'spinDetail',
    // spins for customer detail spin associate
    'spins',
    'spinCounts',
    'spinCompaigns',
    'spinCompaignsTotalCount'
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, SpinCompaignQueryResponse>(gql(compaignQueries.spinCompaigns), {
      name: 'spinCompaignsQuery',
      options: {
        fetchPolicy: 'network-only'
      },
    })
  )(SpinFromContainer)
);
