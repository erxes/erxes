import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from 'modules/common/utils';
import PopoverContent from 'modules/inbox/components/conversationDetail/workarea/responseTemplate/PopoverContent';
import { IBrand } from 'modules/settings/brands/types';
import { queries as responseTemplateQuery } from 'modules/settings/responseTemplates/graphql';
import {
  IResponseTemplate,
  ResponseTemplatesQueryResponse,
  ResponseTemplatesTotalCountQueryResponse
} from 'modules/settings/responseTemplates/types';
import React from 'react';
import { graphql } from 'react-apollo';

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
  responseTemplatesQuery: ResponseTemplatesQueryResponse;
  responseTemplatesTotalCountQuery: ResponseTemplatesTotalCountQueryResponse;
} & Props;
const PopoverContentContainer = (props: FinalProps) => {
  const {
    brands,
    search,
    responseTemplatesQuery,
    responseTemplatesTotalCountQuery
  } = props;

  if (
    responseTemplatesQuery.loading ||
    responseTemplatesTotalCountQuery.loading
  ) {
    return null;
  }

  const fetchMore = (variables: { page: number; perPage: number }) => {
    responseTemplatesQuery.fetchMore({
      variables,
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }

        const prevTemplates = prev.responseTemplates || [];

        const fetchedTemplates = fetchMoreResult.responseTemplates || [];

        return {
          ...prev,
          responseTemplates: [...prevTemplates, ...fetchedTemplates]
        };
      }
    });
  };

  const onSearchChange = (name: string, value: string) => {
    search(name, value);
  };

  const responseTemplates = responseTemplatesQuery.responseTemplates;
  const count = responseTemplatesTotalCountQuery.responseTemplatesTotalCount;
  const hasMore = count > responseTemplates.length;

  const updatedProps = {
    ...props,
    onSearchChange,
    brands,
    fetchMore,
    hasMore,
    responseTemplates: responseTemplatesQuery.responseTemplates
  };

  return <PopoverContent {...updatedProps} />;
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
                perPage: 10,
                searchValue,
                brandId
              }
            };
          }
        }
      ),
      graphql(gql(responseTemplateQuery.responseTemplatesTotalCount), {
        name: 'responseTemplatesTotalCountQuery'
      })
    )(PopoverContentContainer)
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
