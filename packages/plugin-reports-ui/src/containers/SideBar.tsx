import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import SideBarComponent from '../components/SideBar';
import {
  EditTypeMutationResponse,
  RemoveTypeMutationResponse,
  TypeQueryResponse
} from '../types';
import { mutations, queries } from '../graphql';
import React from 'react';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  history: any;
  currentTypeId?: string;
};

type FinalProps = {
  listReportsTypeQuery?: TypeQueryResponse;
} & Props &
  RemoveTypeMutationResponse &
  EditTypeMutationResponse;

const SideBar = (props: FinalProps) => {
  const { listReportsTypeQuery, typesEdit, typesRemove, history } = props;

  const updatedProps = {
    ...props
  };

  return <SideBarComponent {...updatedProps} />;
};

export default SideBar;
// export default withProps<Props>(
//   compose()(TypesListContainer)
// graphql(gql(mutations.removeType), {
//   name: 'typesRemove',
//   options: () => ({
//     refetchQueries: ['listReportsTypeQuery']
//   })
// })
// );
