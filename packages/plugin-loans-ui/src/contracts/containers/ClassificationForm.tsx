import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import * as compose from 'lodash.flowright';
import { withProps, ButtonMutate, withCurrentUser } from '@erxes/ui/src';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import React from 'react';
import { mutations } from '../graphql';
import { IContract } from '../types';
import { UsersQueryResponse } from '@erxes/ui/src/auth/types';
import { IUser } from '@erxes/ui/src/auth/types';
import { __ } from 'coreui/utils';
import ClassificationForm from '../components/list/ClassificationForm';
import { queries } from '../../contractTypes/graphql';

type Props = {
  contracts: IContract[];
  contractTypesMain: any;
  cp?: (contractId: string) => void;
  closeModal: () => void;
};

type FinalProps = {
  usersQuery: UsersQueryResponse;
  currentUser: IUser;
  contracts: IContract[];
} & Props;

class ContractFromContainer extends React.Component<FinalProps> {
  render() {
    const renderButton = ({
      name,
      values,
      isSubmitted,
      object,
      disabled
    }: IButtonMutateProps & { disabled: boolean }) => {
      const { closeModal } = this.props;

      const afterSave = () => {
        closeModal();
      };

      return (
        <ButtonMutate
          mutation={mutations.changeClassification}
          variables={{ classifications: values }}
          callback={afterSave}
          refetchQueries={getRefetchQueries()}
          isSubmitted={isSubmitted}
          type="submit"
          disabled={disabled}
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        >
          {__('Save')}
        </ButtonMutate>
      );
    };

    if (this.props.contractTypesMain?.contractTypesMain?.list?.length > 0) {
      const updatedProps = {
        ...this.props,
        contractTypes: this.props.contractTypesMain?.contractTypesMain?.list,
        renderButton
      };

      return <ClassificationForm {...updatedProps} />;
    } else return <div />;
  }
}

const getRefetchQueries = () => {
  return [
    'contractsMain',
    'contractDetail',
    'contracts',
    'contractCounts',
    'activityLogs',
    'schedules'
  ];
};

export default withCurrentUser(
  withProps<Props>(
    compose(
      graphql<any, any, any>(gql(queries.contractTypesMain), {
        name: 'contractTypesMain',
        options: ({ queryParams, ...other }) => {
          const constractTypeIds = other.contracts.map(a => a.contractTypeId);
          return {
            variables: {
              ids: constractTypeIds
            },
            fetchPolicy: 'network-only'
          };
        }
      })
    )(ContractFromContainer)
  )
);
