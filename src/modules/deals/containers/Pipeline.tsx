import gql from 'graphql-tag';
import _ from 'lodash';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';

import { Spinner } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { Pipeline } from '../components';
import { STORAGE_PIPELINE_KEY } from '../constants';
import { mutations, queries } from '../graphql';
import { ICommonParams, IPipeline, IStage } from '../types';
import { collectOrders } from '../utils';

type Props = {
  pipeline: IPipeline;
  state: any;
  index: number;
  stages: IStage[];
  stagesUpdateOrderMutation: (
    params: { variables: { orders } }
  ) => Promise<any>;
  stagesChangeMutation: (
    params: {
      variables: { _id: string; pipelineId: string };
    }
  ) => Promise<void>;
};

class PipelineContainer extends React.Component<
  Props,
  { stages: ICommonParams[] }
> {
  constructor(props) {
    super(props);

    const { stages } = props;

    this.state = { stages };
  }

  getConfig() {
    return JSON.parse(localStorage.getItem(STORAGE_PIPELINE_KEY) || '') || {};
  }

  setConfig(value: string) {
    const { index } = this.props;

    const expandConfig = this.getConfig();

    expandConfig[index] = value;

    localStorage.setItem(STORAGE_PIPELINE_KEY, JSON.stringify(expandConfig));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.state !== nextProps.state) {
      const {
        state: { type, index, itemId },
        pipeline,
        stagesUpdateOrderMutation,
        stagesChangeMutation
      } = nextProps;

      const { stages } = this.state;

      if (type === 'removeItem') {
        // Remove from list
        stages.splice(index, 1);
      }

      if (type === 'addItem') {
        // Add to list
        stages.splice(index, 0, { _id: itemId });

        // if move to other pipeline, will change pipelineId
        stagesChangeMutation({
          variables: { _id: itemId, pipelineId: pipeline._id }
        }).catch(error => {
          Alert.error(error.message);
        });
      }

      const orders = collectOrders(_.map(stages, '_id'));

      stagesUpdateOrderMutation({
        variables: { orders }
      }).catch(error => {
        Alert.error(error.message);
      });

      this.setState({ stages });
    }
  }

  render() {
    const { index } = this.props;

    // get pipeline expanding config from localStorage
    const expandConfig = this.getConfig();

    const extendedProps = {
      ...this.props,
      isExpanded: expandConfig[index],
      onToggle: value => this.setConfig(value),
      stages: this.state.stages
    };

    return <Pipeline {...extendedProps} />;
  }
}

const PipelineContainerWithData = compose(
  graphql(gql(mutations.stagesUpdateOrder), {
    name: 'stagesUpdateOrderMutation'
  }),
  graphql(gql(mutations.stagesChange), {
    name: 'stagesChangeMutation'
  })
)(PipelineContainer);

class StagesWithPipeline extends React.Component<{ stagesQuery: any }> {
  render() {
    const { stagesQuery } = this.props;

    if (stagesQuery.loading) {
      return <Spinner />;
    }

    const stages = stagesQuery.dealStages;

    const extendedProps = {
      ...this.props,
      stages
    };

    return <PipelineContainerWithData {...extendedProps} />;
  }
}

export default compose(
  graphql(gql(queries.stages), {
    name: 'stagesQuery',
    options: ({ pipeline }: { pipeline: IPipeline }) => ({
      variables: {
        pipelineId: pipeline._id
      }
    })
  })
)(StagesWithPipeline);
