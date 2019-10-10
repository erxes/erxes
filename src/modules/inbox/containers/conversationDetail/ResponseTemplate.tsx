import gql from 'graphql-tag';
import ResponseTemplate from 'modules/inbox/components/conversationDetail/workarea/ResponseTemplate';
import { mutations, queries } from 'modules/inbox/graphql';
import { queries as responseTemplateQuery } from 'modules/settings/responseTemplates/graphql';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../common/utils';
import { AllBrandsQueryResponse } from '../../../settings/brands/types';
import {
  IResponseTemplate,
  ResponseTemplatesQueryResponse,
  SaveResponseTemplateMutationResponse,
  SaveResponsTemplateMutationVariables
} from '../../../settings/responseTemplates/types';
import { AppConsumer } from 'appContext';

type Props = {
  onSelect: (responseTemplate?: IResponseTemplate) => void;
  brandId?: string;
  attachments: any[];
  content: string;
};

type FinalProps = {
  brandsQuery: AllBrandsQueryResponse;
  responseTemplatesQuery: ResponseTemplatesQueryResponse;
} & Props &
  SaveResponseTemplateMutationResponse;

const ResponseTemplateContainer = (props: FinalProps) => {
  const {
    brandsQuery,
    responseTemplatesQuery,
    saveResponseTemplateMutation
  } = props;

  if (responseTemplatesQuery.loading || brandsQuery.loading) {
    return null;
  }

  const saveResponseTemplate = (
    variables: SaveResponsTemplateMutationVariables,
    callback: (e?: Error) => void
  ) => {
    saveResponseTemplateMutation({ variables })
      .then(() => {
        responseTemplatesQuery.refetch();
        callback();
      })
      .catch(e => {
        callback(e);
      });
  };

  const updatedProps = {
    ...props,
    brands: brandsQuery.allBrands,
    saveResponseTemplate,
    responseTemplates: responseTemplatesQuery.responseTemplates
  };

  return <ResponseTemplate {...updatedProps} />;
};

const withQuery = () =>
  withProps<Props & { searchValue: string; brandId: string }>(
    compose(
      graphql<Props & { searchValue: string }, ResponseTemplatesQueryResponse>(
        gql(responseTemplateQuery.responseTemplates),
        {
          name: 'responseTemplatesQuery',
          options: ({ searchValue, brandId }) => {
            return {
              variables: {
                perPage: 200,
                searchValue: searchValue,
                brandId: brandId
              }
            };
          }
        }
      ),

      graphql<Props, AllBrandsQueryResponse>(gql(queries.brandList), {
        name: 'brandsQuery'
      }),

      graphql<
        Props,
        SaveResponseTemplateMutationResponse,
        SaveResponsTemplateMutationVariables
      >(gql(mutations.saveResponseTemplate), {
        name: 'saveResponseTemplateMutation',
        options: {
          refetchQueries: [
            {
              query: gql`
                ${queries.responseTemplateList}
              `
            }
          ]
        }
      })
    )(ResponseTemplateContainer)
  );

class Wrapper extends React.Component<
  Props,
  { searchValue: string; brandId: string },
  { WithQuery: React.ReactNode }
> {
  private withQuery;

  constructor(props) {
    super(props);

    this.withQuery = withQuery();

    this.state = { searchValue: '', brandId: '' };
  }

  search = (type: string, value: string) => this.setState({ [type]: value });

  render() {
    const { searchValue, brandId } = this.state;
    const Component = this.withQuery;

    return (
      <AppConsumer>
        {() => (
          <Component
            {...this.props}
            search={this.search}
            searchValue={searchValue}
            brandId={brandId}
          />
        )}
      </AppConsumer>
    );
  }
}

export default Wrapper;
