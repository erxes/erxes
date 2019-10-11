import gql from 'graphql-tag';
import { withProps } from 'modules/common/utils';
import PopoverContent from 'modules/inbox/components/conversationDetail/workarea/responseTemplate/PopoverContent';
import { mutations, queries } from 'modules/inbox/graphql';
import { IBrand } from 'modules/settings/brands/types';
import { queries as responseTemplateQuery } from 'modules/settings/responseTemplates/graphql';
import {
  IResponseTemplate,
  ResponseTemplatesQueryResponse,
  ResponseTemplatesTotalCountQueryResponse,
  SaveResponseTemplateMutationResponse,
  SaveResponsTemplateMutationVariables
} from 'modules/settings/responseTemplates/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';

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
} & Props &
  SaveResponseTemplateMutationResponse;

const PopoverContentContainer = (props: FinalProps) => {
  const {
    brands,
    search,

    responseTemplatesQuery,
    responseTemplatesTotalCountQuery,
    saveResponseTemplateMutation
  } = props;

  if (
    responseTemplatesQuery.loading ||
    responseTemplatesTotalCountQuery.loading
  ) {
    return null;
  }

  const fetchMore = variables => {
    responseTemplatesQuery.fetchMore({
      variables,
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev;
        }

        const prevTemplates = prev.responseTemplates || [];

        const prevTemplateIds = prevTemplates.map(
          (template: IResponseTemplate) => template._id
        );

        const fetchedTemplates: IResponseTemplate[] = [];
        for (const template of fetchMoreResult.responseTemplates) {
          if (!prevTemplateIds.includes(template._id)) {
            fetchedTemplates.push(template);
          }
        }
        return {
          ...prev,
          responseTemplates: [...fetchedTemplates, ...prevTemplates]
        };
      }
    });
  };

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

  const responseTemplates = responseTemplatesQuery.responseTemplates;
  const count = responseTemplatesTotalCountQuery.responseTemplatesTotalCount;

  const hasMore = count > responseTemplates.length;

  const updatedProps = {
    ...props,
    onSearchChange,
    brands,
    saveResponseTemplate,
    fetchMore,
    hasMore,
    responseTemplates: responseTemplatesQuery.responseTemplates
  };

  return <PopoverContent {...updatedProps} />;
};

const withQuery = () =>
  withProps<Props & { searchValue: string; brandId: string; limit: number }>(
    compose(
      graphql<Props & { searchValue: string }, ResponseTemplatesQueryResponse>(
        gql(responseTemplateQuery.responseTemplates),
        {
          name: 'responseTemplatesQuery',
          options: ({ searchValue, brandId }) => {
            return {
              variables: {
                searchValue,
                brandId
              }
            };
          }
        }
      ),
      graphql(gql(responseTemplateQuery.responseTemplatesTotalCount), {
        name: 'responseTemplatesTotalCountQuery'
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
