import * as compose from 'lodash.flowright';

import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';

import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import PipelineList from '../../components/home/PipelineList';
import { PipelinesQueryResponse } from '@erxes/ui-cards/src/boards/types';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import mutations from '@erxes/ui-cards/src/settings/boards/graphql/mutations';
import { queries } from '@erxes/ui-cards/src/boards/graphql';
import { withProps } from '@erxes/ui/src/utils';
import { withRouter } from 'react-router-dom';

type Props = { queryParams: any } & IRouterProps;

type FinalProps = {
  pipelinesQuery?: PipelinesQueryResponse;
} & Props;

class PipelineListContainer extends React.Component<FinalProps> {
  render() {
    const { queryParams, pipelinesQuery } = this.props;

    let pipelines = pipelinesQuery ? pipelinesQuery.pipelines || [] : [];

    if (queryParams.state) {
      pipelines = pipelines.filter(
        pipeline => pipeline.state === queryParams.state
      );
    }

    const renderAddButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      const afterSave = () => {
        if (callback) {
          callback();
        }

        if (pipelinesQuery) {
          pipelinesQuery.refetch(queryParams.id);
        }
      };

      return (
        <ButtonMutate
          mutation={mutations.pipelineAdd}
          variables={values}
          callback={afterSave}
          refetchQueries={[]}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
        />
      );
    };

    return (
      <PipelineList renderAddButton={renderAddButton} pipelines={pipelines} />
    );
  }
}

export default withRouter(
  withProps<Props>(
    compose(
      graphql<Props, PipelinesQueryResponse>(gql(queries.pipelines), {
        name: 'pipelinesQuery',
        options: ({ queryParams: { id } }) => ({
          variables: {
            boardId: id || '',
            type: 'growthHack'
          }
        })
      })
    )(PipelineListContainer)
  )
);
