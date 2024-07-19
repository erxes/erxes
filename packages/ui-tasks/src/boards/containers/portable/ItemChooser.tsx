import * as compose from 'lodash.flowright';

import {
  IFilterParams,
  IItem,
  IOptions,
  ItemsQueryResponse,
  SaveMutation
} from '../../types';

import AddForm from './AddForm';
import ConformityChooser from '../../../conformity/containers/ConformityChooser';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';

type IProps = {
  search: (value: string, loadMore?: boolean) => void;
  searchValue: string;
  filterStageId?: (
    stageId?: string,
    boardId?: string,
    pipelineId?: string
  ) => void;
  perPage?: number;
  stageId?: string;
  boardId?: string;
  pipelineId?: string;
  showSelect?: boolean;
};

type FinalProps = {
  itemsQuery: ItemsQueryResponse;
  addMutation: SaveMutation;
} & IProps;

class ItemChooserContainer extends React.Component<
  WrapperProps & FinalProps,
  { newItem?: IItem }
> {
  constructor(props) {
    super(props);

    this.state = {
      newItem: undefined
    };
  }

  resetAssociatedItem = () => {
    return this.setState({ newItem: undefined });
  };

  render() {
    const { data, itemsQuery, search, perPage } = this.props;

    const queryName = data.options.queriesName.itemsQuery;
    const datas = itemsQuery[queryName] || [];

    const renderName = item => {
      return item.name || 'Unknown';
    };

    const getAssociatedItem = (newItem: IItem) => {
      this.setState({ newItem });
    };

    const onLoadMore = () => {
      return (
        itemsQuery &&
        itemsQuery.fetchMore({
          variables: {
            skip: datas.length
          },
          updateQuery: (prevResult, { fetchMoreResult }) => {
            if (!fetchMoreResult || fetchMoreResult[queryName].length === 0) {
              return prevResult;
            }

            const prevItems = prevResult[queryName] || [];
            const prevItemIds = prevItems.map(item => item._id);

            const fetchedItems: any[] = [];

            for (const item of fetchMoreResult[queryName]) {
              if (!prevItemIds.includes(item._id)) {
                fetchedItems.push(item);
              }
            }

            return {
              ...prevResult,
              [queryName]: [...prevItems, ...fetchedItems]
            };
          }
        })
      );
    };

    const updatedProps = {
      ...this.props,
      data: {
        _id: data._id,
        name: renderName(data),
        datas: data.items,
        mainTypeId: data.mainTypeId,
        mainType: data.mainType,
        isRelated: data.isRelated,
        relType: data.options.type,
        options: data.options
      },
      search,
      onLoadMore,
      clearState: () => search(''),
      perPage: perPage || 10,
      title: data.options.title,
      renderName,
      renderForm: formProps => (
        <AddForm
          {...formProps}
          refetch={itemsQuery.refetch}
          options={data.options}
          boardId={this.props.boardId}
          pipelineId={this.props.pipelineId}
          stageId={this.props.stageId}
          showSelect={true}
          getAssociatedItem={getAssociatedItem}
        />
      ),
      newItem: this.state.newItem,
      resetAssociatedItem: this.resetAssociatedItem,
      datas,
      loading: itemsQuery.loading,
      refetchQuery: data.options.queries.itemsQuery
    };

    return <ConformityChooser {...updatedProps} />;
  }
}

const WithQuery = ({ options }) => {
  return withProps<IProps>(
    compose(
      graphql<IProps & WrapperProps, ItemsQueryResponse, IFilterParams>(
        gql(options.queries.itemsQuery),
        {
          name: 'itemsQuery',
          options: ({ searchValue, stageId, data }) => {
            return {
              variables: {
                search: searchValue,
                stageId,
                mainType: data.mainType,
                mainTypeId: data.mainTypeId,
                isRelated: data.isRelated,
                relType: data.options.type,
                sortField: 'createdAt',
                sortDirection: -1
              },
              fetchPolicy: data.isRelated ? 'network-only' : 'cache-first'
            };
          }
        }
      )
    )(ItemChooserContainer)
  );
};

type WrapperProps = {
  data: {
    _id?: string;
    name: string;
    items: IItem[];
    options: IOptions;
    mainTypeId?: string;
    mainType?: string;
    isRelated?: boolean;
  };
  onSelect: (datas: IItem[]) => void;
  showSelect?: boolean;
  closeModal: () => void;
};

export default class Wrapper extends React.Component<
  WrapperProps,
  {
    searchValue: string;
    stageId?: string;
    pipelineId?: string;
    boardId?: string;
  }
> {
  private withQuery;

  constructor(props) {
    super(props);

    this.state = { searchValue: '', stageId: '', boardId: '', pipelineId: '' };
    this.withQuery = WithQuery({ options: props.data.options });
  }

  search = value => {
    return this.setState({ searchValue: value });
  };

  filterStageId = (stageId, boardId, pipelineId) => {
    return this.setState({ stageId, boardId, pipelineId });
  };

  render() {
    const { searchValue, stageId, boardId, pipelineId } = this.state;
    const Component = this.withQuery;

    return (
      <Component
        {...this.props}
        search={this.search}
        searchValue={searchValue}
        filterStageId={this.filterStageId}
        stageId={stageId}
        boardId={boardId}
        pipelineId={pipelineId}
      />
    );
  }
}
