import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { queries } from 'modules/boards/graphql';
import { PipelinesQueryResponse } from 'modules/boards/types';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps, IRouterProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import mutations from 'modules/settings/boards/graphql/mutations';
import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import PipelineList from '../../components/home/PipelineList';

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
