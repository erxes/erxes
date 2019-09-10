import gql from 'graphql-tag';
import { withProps } from 'modules/common/utils';
import { FieldsQueryResponse, IField } from 'modules/settings/properties/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { IRouterProps } from '../../common/types';
import FormFieldPreview from '../components/FormFieldPreview';
import { queries } from '../graphql';
import { FormDetailQueryResponse } from '../types';

type Props = {
  formId: string;
  onFieldEdit?: (field: IField, props) => void;
  onChange?: (name: string, fields: any) => void;
  onFieldChange?: (name: string, value: IField[]) => void;
  wrapper?: ({ form, content }) => JSX.Element;
};

type FinalProps = {
  fieldsQuery: FieldsQueryResponse;
  formDetailQuery: FormDetailQueryResponse;
} & Props &
  IRouterProps;

class FormFieldPreviewContainer extends React.Component<FinalProps> {
  render() {
    const { fieldsQuery, formDetailQuery } = this.props;

    if (fieldsQuery.loading || formDetailQuery.loading) {
      return false;
    }

    const dbFields = fieldsQuery.fields || [];
    const form = formDetailQuery.formDetail || {};

    const updatedProps = {
      ...this.props,
      fields: dbFields.map(field => ({ ...field })),
      form
    };

    return <FormFieldPreview {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<
      Props,
      FieldsQueryResponse,
      { contentType: string; contentTypeId: string }
    >(gql(queries.fields), {
      name: 'fieldsQuery',
      skip: ({ formId }) => !formId,
      options: ({ formId }) => {
        return {
          variables: {
            contentType: 'form',
            contentTypeId: formId
          },
          fetchPolicy: 'network-only'
        };
      }
    }),
    graphql<Props, FormDetailQueryResponse, { _id: string }>(
      gql(queries.formDetail),
      {
        name: 'formDetailQuery',
        skip: ({ formId }) => !formId,
        options: ({ formId }) => ({
          variables: {
            _id: formId
          }
        })
      }
    )
  )(withRouter<FinalProps>(FormFieldPreviewContainer))
);
