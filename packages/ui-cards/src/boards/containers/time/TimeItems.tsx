import React from 'react';
import TimeView from '../../components/Time';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import { Alert, withProps } from '@erxes/ui/src/utils';
import {
  IFilterParams,
  IItem,
  IOptions,
  IPipeline,
  ItemsQueryResponse,
  ITimeData,
  RemoveStageMutation,
  SaveItemMutation
} from '../../types';
import { TagsQueryResponse } from '@erxes/ui-tags/src/types';
import { queries, subscriptions } from '../../graphql';
import { getFilterParams } from '../../utils';
import { queries as tagQueries } from '@erxes/ui-tags/src/graphql';
import moment from 'moment';

type Props = {
  options: IOptions;
  queryParams: IFilterParams;
  pipeline: IPipeline;
  type: string;
};

type FinalProps = {
  itemsQuery: ItemsQueryResponse;
  addMutation: SaveItemMutation;
  removeStageMutation: RemoveStageMutation;
  tagsQuery: TagsQueryResponse;
  editMutation: any;
} & Props;

type State = {
  items: IItem[];
  perPage: number;
};

class TimeItemsContainer extends React.PureComponent<FinalProps, State> {
  private unsubcribe;

  constructor(props) {
    super(props);

    const { itemsQuery, options } = props;

    this.state = {
      items: itemsQuery[options.queriesName.itemsQuery] || [],
      perPage: 20
    };
  }

  componentDidMount() {
    const { itemsQuery, pipeline } = this.props;

    this.unsubcribe = itemsQuery.subscribeToMore({
      document: gql(subscriptions.pipelinesChanged),
      variables: { _id: pipeline._id },
      updateQuery: (
        prev,
        {
          subscriptionData: {
            data: { pipelinesChanged }
          }
        }
      ) => {
        if (!pipelinesChanged || !pipelinesChanged.data) {
          return;
        }

        itemsQuery.refetch();
      }
    });
  }

  componentWillUnmount() {
    this.unsubcribe();
  }

  componentWillReceiveProps(nextProps: FinalProps) {
    const { itemsQuery, options, queryParams } = nextProps;

    if (this.queryParamsChanged(this.props.queryParams, queryParams)) {
      itemsQuery.refetch();
    }

    if (!itemsQuery.loading) {
      const items = itemsQuery[options.queriesName.itemsQuery] || [];

      this.setState({ items });
    }
  }

  queryParamsChanged = (queryParams: any, nextQueryParams: any) => {
    if (nextQueryParams.itemId || (!queryParams.key && queryParams.itemId)) {
      return false;
    }

    if (queryParams !== nextQueryParams) {
      return true;
    }

    return false;
  };

  render() {
    const { itemsQuery, options, tagsQuery, editMutation } = this.props;

    const itemMoveResizing = (itemId: string, data: ITimeData) => {
      const variables: any = { _id: itemId };

      if (data.startDate) {
        variables['startDate'] = data.startDate;
      }

      if (data.closeDate) {
        variables['closeDate'] = data.closeDate;
      }

      if (data.tagId) {
        variables['tagIds'] = data.tagId;
      }

      editMutation({ variables })
        .then(() => {
          Alert.success(options.texts.changeSuccessText);
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const refetch = () => {
      itemsQuery.refetch().then(({ data }) => {
        this.setState({
          items: data[options.queriesName.itemsQuery] || []
        });
      });
    };

    const tags = tagsQuery.tags || [];

    const tagResources =
      tags &&
      tags.map(tag => {
        return {
          id: tag._id,
          title: tag.name
        };
      });

    const events: any[] = [];

    for (const deal of this.state.items) {
      for (const tagId of deal.tagIds || []) {
        events.push({
          id: deal._id,
          group: tagId,
          start_time: moment.utc(deal.startDate),
          end_time: moment.utc(deal.closeDate),
          title: deal.name
        });
      }
    }

    const updatedProps = {
      ...this.props,
      refetch: refetch,
      items: this.state.items,
      resources: tagResources,
      events: events,
      tags: tags,
      itemMoveResizing
    };

    if (itemsQuery.loading) {
      return null;
    }

    return <TimeView {...updatedProps} />;
  }
}

const withQuery = ({ options }) => {
  return withProps<Props>(
    compose(
      graphql<Props, TagsQueryResponse, { type: string }>(
        gql(tagQueries.tags),
        {
          name: 'tagsQuery',
          options: (props: Props) => ({
            variables: {
              type: `cards:${props.type}`,
              parentId: props.pipeline.tagId || ''
            }
          })
        }
      ),
      graphql<Props>(gql(options.queries.itemsQuery), {
        name: 'itemsQuery',
        options: ({ queryParams }) => ({
          variables: getFilterParams(queryParams, options.getExtraParams),
          fetchPolicy: 'network-only'
        })
      }),
      graphql<Props>(gql(options.mutations.editMutation), {
        name: 'editMutation',
        options: ({ queryParams }: Props) => ({
          refetchQueries: [
            {
              query: gql(options.queries.itemsQuery),
              variables: getFilterParams(queryParams, options.getExtraParams)
            }
          ]
        })
      })
    )(TimeItemsContainer)
  );
};

class WithData extends React.Component<Props> {
  private withQuery;

  constructor(props) {
    super(props);

    this.withQuery = withQuery({ options: props.options });
  }

  render() {
    const Component = this.withQuery;

    return <Component {...this.props} />;
  }
}

export default withProps<Props>(WithData);
