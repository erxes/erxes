import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import EmptyState from 'modules/common/components/EmptyState';
import Spinner from 'modules/common/components/Spinner';
import { withProps } from 'modules/common/utils';
import ConformityChooser from 'modules/conformity/containers/ConformityChooser';
import React from 'react';
import { graphql } from 'react-apollo';
import {
  IFilterParams,
  IItem,
  IOptions,
  ItemsQueryResponse,
  SaveMutation
} from '../../types';
import AddForm from './AddForm';

type IProps = {
  search: (value: string, loadMore?: boolean) => void;
  searchValue: string;
  filterStageId?: (
    stageId?: string,
    boardId?: string,
    pipelineId?: string
  ) => void;
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
  { newItem?: string }
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
    const { data, itemsQuery, search } = this.props;

    const renderName = item => {
      return item.name || 'Unknown';
    };

    const getAssociatedItem = (newItem: string) => {
      this.setState({ newItem });
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
      perPage: 0,
      title: data.options.title,
      renderName,
      datas: itemsQuery[data.options.queriesName.itemsQuery] || [],
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
      hasBoardChooser: true,
      newItem: this.state.newItem,
      resetAssociatedItem: this.resetAssociatedItem,
      clearState: () => search(''),
      refetchQuery: data.options.queries.itemsQuery
    };

    if (itemsQuery.loading) {
      return <Spinner />;
    }

    if (updatedProps.datas.length === 0) {
      return <EmptyState text="No matching items found" icon="list-ul" />;
    }

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
