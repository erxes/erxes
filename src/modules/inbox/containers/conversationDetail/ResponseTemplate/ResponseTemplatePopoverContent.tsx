import gql from 'graphql-tag';
import ResponseTemplate from 'modules/inbox/components/conversationDetail/workarea/ResponseTemplate/ResponseTemplatePopoverContent';
import { mutations, queries } from 'modules/inbox/graphql';
import { queries as responseTemplateQuery } from 'modules/settings/responseTemplates/graphql';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { withProps } from '../../../../common/utils';
import {
  AllBrandsQueryResponse,
  IBrand
} from '../../../../settings/brands/types';

import {
  IResponseTemplate,
  ResponseTemplatesQueryResponse,
  SaveResponseTemplateMutationResponse,
  SaveResponsTemplateMutationVariables
} from '../../../../settings/responseTemplates/types';
import { AppConsumer } from 'appContext';

type Props = {
  onSelect: (responseTemplate?: IResponseTemplate) => void;
  brands: IBrand[];
  brandId?: string;
  searchValue?: string;
  onSelectTemplate: () => void;
};

type FinalProps = {
  search: (name: string, value: string) => void;
  brandsQuery: AllBrandsQueryResponse;
  responseTemplatesQuery: ResponseTemplatesQueryResponse;
} & Props &
  SaveResponseTemplateMutationResponse;

const ResponseTemplatePopoverContentContainer = (props: FinalProps) => {
  const {
    brands,
    search,
    brandsQuery,
    responseTemplatesQuery,
    saveResponseTemplateMutation
  } = props;

  if (responseTemplatesQuery.loading || brandsQuery.loading) {
    return null;
  }

  const onSearchChange = (name: string, value: string) => {
    search(name, value);
  };

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
    onSearchChange,
    brands,
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
    )(ResponseTemplatePopoverContentContainer)
  );

type WrapperState = {
  searchValue: string;
  brandId: string;
};

class Wrapper extends React.Component<Props, WrapperState> {
  private withQuery;

  constructor(props) {
    super(props);

    this.withQuery = withQuery();

    this.state = { searchValue: '', brandId: props.brandId };
  }

  search = <T extends keyof WrapperState>(name: T, value: WrapperState[T]) => {
    this.setState(({ [name]: value } as unknown) as Pick<
      WrapperState,
      keyof WrapperState
    >);
  };

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
