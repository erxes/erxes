import { Alert } from '@erxes/ui/src';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';
import PageForm from '../../components/pages/PageForm';
import React from 'react';
import { mutations, queries } from '../../graphql';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';

type Props = {
  _id?: string;
} & IRouterProps;

type FinalProps = Props & {
  pagesAdd: any;
  pagesEdit: any;
  pageDetailQuery?: any;
  templatesQuery: any;
  templatesAdd: any;
};

const FormContainer = (props: FinalProps) => {
  const { pageDetailQuery, history, templatesQuery, templatesAdd } = props;

  if ((pageDetailQuery && pageDetailQuery.loading) || templatesQuery.loading) {
    return null;
  }

  const saveTemplate = (name: string, jsonData: any) => {
    templatesAdd({ variables: { name, jsonData } })
      .then(() => {
        Alert.warning('You successfully added template.');

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
    html: string,
    css: string,
    jsonData
  ) => {
    let method = props.pagesAdd;

    const variables: any = {
      name,
      description,
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

  const templates = templatesQuery.webbuilderTemplates || [];

  const updatedProps = {
    save,
    page,
    templates,
    saveTemplate
  };

  return <PageForm {...updatedProps} />;
};

export default compose(
  graphql<Props>(gql(mutations.add), {
    name: 'pagesAdd',
    options: () => ({
      refetchQueries: [{ query: gql(queries.pages) }]
    })
  }),

  graphql<Props>(gql(mutations.edit), {
    name: 'pagesEdit',
    options: () => ({
      refetchQueries: [{ query: gql(queries.pages) }]
    })
  }),

  graphql(gql(queries.pageDetail), {
    name: 'pageDetailQuery',
    skip: (props: Props) => !props._id,
    options: (props: Props) => ({
      variables: { _id: props._id }
    })
  }),
  graphql(gql(queries.templates), {
    name: 'templatesQuery'
  }),
  graphql(gql(mutations.templatesAdd), {
    name: 'templatesAdd',
    options: () => ({
      refetchQueries: [{ query: gql(queries.templates) }]
    })
  })
)(withRouter(FormContainer));
