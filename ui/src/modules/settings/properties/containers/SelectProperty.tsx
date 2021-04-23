import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import Spinner from 'modules/common/components/Spinner';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { getConstantFromStore } from 'modules/common/utils';
import React from 'react';
import { ChildProps, graphql } from 'react-apollo';
import SelectProperty from '../components/SelectProperty';
import { mutations, queries } from '../graphql';
import {
  FieldsGroupsQueryResponse,
  FieldsQueryResponse,
  IField
} from '../types';

type Props = {
  queryParams: any;
  onChange: (field: IField) => void;
  defaultValue: string;
  formProps: IFormProps;
  description?: string;
};

type FinalProps = {
  propertiesQuery: FieldsQueryResponse;
  fieldsGroupsQuery: FieldsGroupsQueryResponse;
} & Props;

const SelectPropertyContainer = (props: ChildProps<FinalProps>) => {
  const { propertiesQuery, fieldsGroupsQuery, queryParams } = props;

  let properties = propertiesQuery.fields || [];

  if (queryParams.type === 'customer') {
    properties = properties.filter(e => {
      if (
        [
          'firstName',
          'lastName',
          'middleName',
          'primaryEmail',
          'primaryPhone',
          'owner'
        ].includes(e.type) &&
        e.isDefinedByErxes
      ) {
        return null;
      }
      return e;
    });

    const links: IField[] = getConstantFromStore('social_links').map(link => {
      return {
        _id: `customerLinks_${link.value}`,
        type: `customerLinks_${link.value}`,
        text: link.label
      };
    });

    properties = properties.concat(links);
  }

  if (queryParams.type === 'company') {
    properties = properties.filter(e => {
      if (
        [
          'primaryName',
          'primaryEmail',
          'primaryPhone',
          'owner',
          'plan',
          'code'
        ].includes(e.type) &&
        e.isDefinedByErxes
      ) {
        return null;
      }
      return e;
    });

    const links: IField[] = getConstantFromStore('social_links').map(link => {
      return {
        _id: `companyLinks_${link.value}`,
        type: `companyLinks_${link.value}`,
        text: link.label
      };
    });

    properties = properties.concat(links);
  }

  const groups = fieldsGroupsQuery.fieldsGroups || [];

  if (propertiesQuery.loading || fieldsGroupsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const renderButton = ({
    name,
    values,
    isSubmitted,
    callback
  }: IButtonMutateProps) => {
    const callBackResponse = () => {
      propertiesQuery.refetch();

      if (callback) {
        callback();
      }
    };

    return (
      <ButtonMutate
        mutation={mutations.fieldsAdd}
        variables={values}
        callback={callBackResponse}
        isSubmitted={isSubmitted}
        type="submit"
        successMessage={`You successfully added a ${name}`}
      />
    );
  };

  const updatedProps = {
    ...props,
    properties,
    groups,
    renderButton
  };

  return <SelectProperty {...updatedProps} />;
};

const getRefetchQueries = (queryParams?: any) => {
  return [
    {
      query: gql(queries.fields),
      variables: { contentType: queryParams.type }
    }
  ];
};

export default compose(
  graphql<Props, FieldsQueryResponse>(gql(queries.fields), {
    name: 'propertiesQuery',
    options: ({ queryParams }) => ({
      variables: {
        contentType: queryParams.type,
        isVisible: true
      },
      fetchPolicy: 'network-only',
      refetchQueries: getRefetchQueries(queryParams)
    })
  }),
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
  )
)(SelectPropertyContainer);
