import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
// import ButtonMutate from 'modules/common/components/ButtonMutate';
import Spinner from 'modules/common/components/Spinner';
// import { IButtonMutateProps, IFormProps } from 'modules/common/types';
// import { mutations as brandMutations } from 'modules/settings/brands/graphql';
import { queries } from 'modules/settings/properties/graphql';
import React from 'react';
import { ChildProps, graphql } from 'react-apollo';
// import { BrandsQueryResponse } from '../../brands/types';
import AdvancedSettings from '../components/AdvancedSettings';
import { FieldsQueryResponse } from 'modules/settings/properties/types';

type Props = {
  formId: string;
  //   formProps: IFormProps;
};

type FinalProps = {
  fieldsQuery: FieldsQueryResponse;
} & Props;

const AdvancedSettingsContainer = (props: ChildProps<FinalProps>) => {
  const { fieldsQuery } = props;

  const fields = fieldsQuery.fields || [];

  if (fieldsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const updatedProps = {
    fields
  };

  return <AdvancedSettings {...updatedProps} />;
};

export default compose(
  graphql<Props, FieldsQueryResponse>(gql(queries.fields), {
    name: 'fieldsQuery',
    options: ({ formId }) => {
      return {
        variables: {
          contentType: 'form',
          contentTypeId: formId
        },
        fetchPolicy: 'network-only'
      };
    }
  })
)(AdvancedSettingsContainer);
