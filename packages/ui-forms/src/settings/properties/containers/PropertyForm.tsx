import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import PropertyForm from '../components/PropertyForm';
import { mutations, queries } from '../graphql';
import {
  FieldsAddMutationResponse,
  FieldsEditMutationResponse,
  FieldsGroupsQueryResponse,
  FieldsInputTypesQueryResponse
} from '../types';
import { updateCustomFieldsCache } from '../utils';

type Props = {
  queryParams: any;
  closeModal: () => void;
  renderButton?: (props: IButtonMutateProps) => JSX.Element;
};

type FinalProps = {
  fieldsGroupsQuery: FieldsGroupsQueryResponse;
  fieldsInputTypes: FieldsInputTypesQueryResponse;
} & Props &
  FieldsAddMutationResponse &
  FieldsEditMutationResponse;

const PropertyFormContainer = (props: FinalProps) => {
  const { fieldsGroupsQuery, fieldsInputTypes, queryParams } = props;
  const { type } = queryParams;

  let { renderButton } = props;

  if (!renderButton) {
    renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      const handleCallback = () => {
        updateCustomFieldsCache({
          type,
          doc: values,
          ...(object ? { id: object._id } : {})
        });

        if (callback) {
          return callback();
        }
      };

      return (
        <ButtonMutate
          mutation={object ? mutations.fieldsEdit : mutations.fieldsAdd}
          variables={values}
          callback={handleCallback}
          refetchQueries={getRefetchQueries(queryParams)}
          isSubmitted={isSubmitted}
          type="submit"
          icon="check-circle"
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };
  }

  const updatedProps = {
    ...props,
    type,
    renderButton,
    groups: fieldsGroupsQuery.fieldsGroups,
    inputTypes: fieldsInputTypes?.getFieldsInputTypes || [],
    refetchQueries: getRefetchQueries(queryParams)
  };

  return <PropertyForm {...updatedProps} />;
};

const getRefetchQueries = queryParams => {
  return [
    {
      query: gql(queries.fieldsGroups),
      variables: { contentType: queryParams.type }
    }
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props, FieldsGroupsQueryResponse, { contentType: string }>(
      gql(queries.fieldsGroups),
      {
        name: 'fieldsGroupsQuery',
        options: ({ queryParams }) => ({
          variables: {
            contentType: queryParams.type
          }
        })
      }
    ),
    graphql<Props>(gql(queries.getFieldsInputTypes), {
      name: 'fieldsInputTypes'
    })
  )(PropertyFormContainer)
);
