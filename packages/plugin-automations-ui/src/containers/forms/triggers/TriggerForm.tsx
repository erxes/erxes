import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';
import React from 'react';
import Form from '../../../components/forms/triggers/TriggerForm';
import { ITrigger } from '../../../types';
import { queries } from '../../../graphql';

type Props = {
  onClickTrigger: (trigger: ITrigger) => void;
  triggersConst: ITrigger[];
};

type FinalProps = {
  automationsQuery: any;
} & Props;

const TriggerFormContainer = (props: FinalProps) => {
  const { automationsQuery } = props;

  if (automationsQuery.loading) {
    return <div>...</div>;
  }

  const templates = automationsQuery.automations || [];

  const extendedProps = {
    ...props,
    templates
  };

  return <Form {...extendedProps} />;
};

export default withProps<Props>(
  compose(
    // queries
    graphql<Props, any, any>(gql(queries.automations), {
      name: 'automationsQuery',
      options: () => ({
        variables: { status: 'template' }
      })
    })
  )(TriggerFormContainer)
);
