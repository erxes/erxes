import gql from 'graphql-tag';
import { withProps } from 'modules/common/utils';
import { queries } from 'modules/forms/graphql';
import { FieldsQueryResponse } from 'modules/settings/properties/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import FormFields from '../components/FormFields';

type IProps = {
  formId: string;
  formSubmissions?: any;
  onChangeFormField: (field: any) => void;
};

type FinalProps = {
  fieldsQuery: FieldsQueryResponse;
} & IProps;

class FormFieldsContainer extends React.Component<FinalProps, {}> {
  render() {
    const { fieldsQuery } = this.props;

    const dbFields = fieldsQuery.fields || [];

    const extendedProps = {
      ...this.props,
      fields: dbFields.map(field => ({ ...field }))
    };

    return <FormFields {...extendedProps} />;
  }
}

export default withProps<IProps>(
  compose(
    graphql<IProps>(gql(queries.fields), {
      name: 'fieldsQuery',
      options: ({ formId }) => {
        return {
          variables: {
            contentType: 'form',
            contentTypeId: formId
          }
        };
      }
    })
  )(FormFieldsContainer)
);
