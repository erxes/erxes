import React from 'react';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { IUser } from '@erxes/ui/src/auth/types';
import Spinner from '@erxes/ui/src/components/Spinner';
import { graphql } from '@apollo/client/react/hoc';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import { queries as companyQueries } from '@erxes/ui-contacts/src/companies/graphql';
import { queries as dealsQuery } from '@erxes/ui-cards/src/deals/graphql';

import { IMeeting, RemoveMutationResponse } from '../../../types';
import { mutations } from '../../../graphql';
import { MeetingForm } from '../../../components/myCalendar/meeting/Form';
import { CompaniesQueryResponse } from '@erxes/ui-contacts/src/companies/types';
import { DealsQueryResponse } from '@erxes/ui-cards/src/deals/types';

type Props = {
  queryParams: any;
  meeting?: IMeeting;
  refetch?: any;
  currentUser: IUser;
  closeModal: () => void;
  object?: IMeeting | null;
  calendarDate?: any;
  dealId?: string;
};

type FinalProps = {
  currentUser: IUser;
  companiesQuery: CompaniesQueryResponse;
  dealsQuery: DealsQueryResponse;
} & Props &
  RemoveMutationResponse;

const MeetingFormContainer = (props: FinalProps) => {
  const { companiesQuery, refetch, dealsQuery } = props;

  const renderButton = ({
    passedName,
    values,
    isSubmitted,
    callback,
    object
  }: IButtonMutateProps) => {
    values.title =
      values.title ||
      companiesQuery.companies.find(c => c._id === values.companyId)
        ?.primaryName ||
      '';
    return (
      <ButtonMutate
        mutation={object ? mutations.editMeeting : mutations.addMeeting}
        variables={values}
        callback={callback}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully ${
          object ? 'updated' : 'added'
        } a ${passedName}`}
        refetchQueries={refetch}
      />
    );
  };

  const updatedProps = {
    ...props,
    renderButton
  };

  if (
    (companiesQuery && companiesQuery.loading) ||
    (dealsQuery && dealsQuery.loading)
  ) {
    return <Spinner />;
  }
  return <MeetingForm {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql(gql(companyQueries.companies), {
      name: 'companiesQuery',
      options: () => ({})
    }),
    graphql(gql(dealsQuery.deals), {
      name: 'dealsQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    })
  )(withCurrentUser(MeetingFormContainer))
);
