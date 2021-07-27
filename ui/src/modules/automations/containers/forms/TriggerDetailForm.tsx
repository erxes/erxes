import React from 'react';
import Form from '../../components/forms/TriggerDetailForm';
import { queries } from 'modules/forms/graphql';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { FormsQueryResponse } from 'modules/forms/types';

type Props = {
  closeModal: () => void;
  closeParentModal: () => void;
};

type FinalProps = {
  formsQuery: FormsQueryResponse;
} & Props;

const TriggerDetailFormContainer = (props: FinalProps) => {
  const forms = props.formsQuery.forms || [];

  const extendedProps = {
    ...props,
    forms
  };

  return <Form {...extendedProps} />;
};

export default compose(
  graphql<Props, FormsQueryResponse>(gql(queries.forms), {
    name: 'formsQuery'
  })
)(TriggerDetailFormContainer);
