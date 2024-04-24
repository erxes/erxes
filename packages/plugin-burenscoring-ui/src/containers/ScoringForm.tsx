import { ButtonMutate, withProps, __} from '@erxes/ui/src';
import { IUser } from '@erxes/ui/src/auth/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import * as compose from 'lodash.flowright';
import React from 'react';
import ScoringForm from '../components/ScorinMainForm';
import { mutations, queries } from '../graphql';
import { DetailQueryResponse, ScoringResultResponse } from '../types';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
type Props = {
  customerId: string;
  closeModal: () => void;
  reportPurpose: string;
  keyword: string
};

type FinalProps = {
  detailQuery: DetailQueryResponse;
  scorinResult: ScoringResultResponse;
  currentUser: IUser;
} & Props;

class ScoringFormContainer extends React.Component<FinalProps> {
  render() {
    const { customerId, detailQuery } = this.props;
    const renderButton = ({
      name,
      values,
      isSubmitted,
      object
    }: IButtonMutateProps) => {
      const { closeModal } = this.props;
      const afterSave = () => {
        closeModal();
      }
      values.customerId = customerId
      return (
        <ButtonMutate
        icon="loading"
          mutation={mutations.toCheckScoring}
          variables={values}
          callback={afterSave}
          refetchQueries={refetch()}
          isSubmitted={isSubmitted}
          type="submit"
          uppercase={false}
          successMessage={`You successfully score
           a ${name}`}
        >  {__('Scoring')}</ButtonMutate>
      );
    };

 
    const updatedProps = {
      ...this.props,
      renderButton,
      customerScore: detailQuery.getCustomerScore || {},
    };
    return <ScoringForm {...updatedProps} />;
  }
}

const refetch = () => {
  return ['burenCustomerScoringsMain','getCustomerScore'];
};
export default withProps<Props>(
  compose(
    graphql<Props, DetailQueryResponse, { customerId: string }>(gql(queries.getCustomerScore), {
      name: 'detailQuery',
      options: ({ customerId }) => {
        return {
          variables: {customerId: customerId}
        };
      }
    })
  )(ScoringFormContainer)
);
