import { Alert, confirm } from '@erxes/ui/src';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';
import PageForm from '../../components/pages/PageForm';
import React from 'react';
import { mutations, queries } from '../../graphql';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import {
  PageDetailQueryResponse,
  PagesAddMutationResponse,
  PagesEditMutationResponse,
  PagesMainQueryResponse,
  TemplatesAddMutationResponse,
  TemplatesDetailQueryResponse,
  TypesQueryResponse
} from '../../types';

type Props = {
  _id?: string;
  templateId?: string;
} & IRouterProps;

type FinalProps = Props & {
  pageDetailQuery?: PageDetailQueryResponse;
  pagesMainQuery: PagesMainQueryResponse;
  typesQuery: TypesQueryResponse;
  templateDetailQuery: TemplatesDetailQueryResponse;
} & PagesAddMutationResponse &
  PagesEditMutationResponse &
  TemplatesAddMutationResponse;

const FormContainer = (props: FinalProps) => {
  const {
    pageDetailQuery,
    history,
    templatesAdd,
    pagesMainQuery,
    typesQuery,
    templateDetailQuery
  } = props;

  if (
    (pageDetailQuery && pageDetailQuery.loading) ||
    pagesMainQuery.loading ||
    typesQuery.loading ||
    (templateDetailQuery && templateDetailQuery.loading)
  ) {
    return null;
  }

  const saveTemplate = (name: string, jsonData: any, html: string) => {
    templatesAdd({ variables: { name, jsonData, html } })
      .then(() => {
        Alert.success('You successfully added template.');

        history.push({
          pathname: '/webbuilder/pages'
        });
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const save = (
    name: string,
    description: string,
    siteId: string,
    html: string,
    css: string,
    jsonData
  ) => {
    let method: any = props.pagesAdd;

    const variables: any = {
      name,
      description,
      siteId,
      html,
      css,
      jsonData
    };

    if (props._id) {
      method = props.pagesEdit;
      variables._id = props._id;
    }

    method({ variables })
      .then(() => {
        Alert.success(`Success`);

        history.push({
          pathname: '/webbuilder/pages'
        });
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  let page;

  if (pageDetailQuery) {
    page = pageDetailQuery.webbuilderPageDetail;
  }

  const pagesMain = pagesMainQuery.webbuilderPagesMain || {};
  const contentTypes = typesQuery.webbuilderContentTypes || [];
  const template =
    (templateDetailQuery && templateDetailQuery.webbuilderTemplateDetail) || {};

  const updatedProps = {
    ...props,
    save,
    page,
    saveTemplate,
    contentTypes,
    pages: pagesMain.list || [],
    template
  };

  return <PageForm {...updatedProps} />;
};

const refetchPageQueries = () => [{ query: gql(queries.pagesMain) }];

const refetchTemplateQuery = () => [
  { query: gql(queries.templates) },
  { query: gql(queries.templatesTotalCount) }
];

export default compose(
  graphql<{}, PagesAddMutationResponse>(gql(mutations.add), {
    name: 'pagesAdd',
    options: () => ({
      refetchQueries: refetchPageQueries()
    })
  }),

  graphql<Props, PagesEditMutationResponse>(gql(mutations.edit), {
    name: 'pagesEdit',
    options: ({ _id }) => ({
      refetchQueries: [
        ...refetchPageQueries(),
        { query: gql(queries.pageDetail), variables: { _id } }
      ]
    })
  }),

  graphql<Props, PageDetailQueryResponse, { _id?: string }>(
    gql(queries.pageDetail),
    {
      name: 'pageDetailQuery',
      skip: ({ _id }) => !_id,
      options: ({ _id }) => ({
        variables: { _id }
      })
    }
  ),
  graphql<{}, TemplatesAddMutationResponse>(gql(mutations.templatesAdd), {
    name: 'templatesAdd',
    options: () => ({
      refetchQueries: refetchTemplateQuery()
    })
  }),
  graphql<Props, TemplatesDetailQueryResponse>(gql(queries.templateDetail), {
    name: 'templateDetailQuery',
    skip: ({ templateId }) => !templateId,
    options: ({ templateId }) => ({
      variables: {
        _id: templateId
      }
    })
  }),
  graphql<{}, TypesQueryResponse>(gql(queries.contentTypes), {
    name: 'typesQuery'
  }),
  graphql<{}, PagesMainQueryResponse>(gql(queries.pagesMain), {
    name: 'pagesMainQuery'
  })
)(withRouter(FormContainer));
