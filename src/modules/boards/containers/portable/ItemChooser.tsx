import gql from 'graphql-tag';
import { Alert, renderWithProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import AddForm from '../../components/portable/AddForm';
import ItemChooser from '../../components/portable/ItemChooser';
import { queries } from '../../graphql';
import {
  IFilterParams,
  IItem,
  IItemParams,
  IOptions,
  ItemsQueryResponse,
  RelatedItemsQueryResponse,
  SaveMutation
} from '../../types';

type IProps = {
  search: (value: string) => void;
  searchValue: string;
  options: IOptions;
  mainType?: string;
  mainTypeId?: string;
  boardId?: string;
  pipelineId?: string;
  filterStageId: (stageId: string) => void;
  stageId?: string;
  showSelect?: boolean;
};

type FinalProps = {
  itemsQuery: ItemsQueryResponse;
  relatedItemsQuery: RelatedItemsQueryResponse;
  addMutation: SaveMutation;
} & IProps;

const ItemChooserContainer = (props: WrapperProps & FinalProps) => {
  const { data, itemsQuery, relatedItemsQuery, search, filterStageId } = props;

  const saveItem = (doc: IItemParams, callback: () => void) => {
    const { addMutation } = props;

    addMutation({ variables: doc })
      .then(() => {
        Alert.success(data.options.texts.addSuccessText);
        callback();
        itemsQuery.refetch();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const renderName = item => {
    return item.name || 'Unknown';
  };

  const datas = data.isRelated
    ? relatedItemsQuery[data.options.queriesName.itemsQuery]
    : itemsQuery[data.options.queriesName.itemsQuery];

  const updatedProps = {
    ...props,
    data: {
      _id: data._id,
      name: renderName(data),
      datas: data.items,
      mainTypeId: data.mainTypeId,
      mainType: data.mainType,
      isRelated: data.isRelated
    },
    search,
    filterStageId,
    clearStateStage: () => filterStageId(''),
    clearState: () => search(''),
    title: data.options.title,
    renderForm: formProps => (
      <AddForm
        {...formProps}
        action={saveItem}
        options={data.options}
        boardId={props.boardId}
        pipelineId={props.pipelineId}
        stageId={props.stageId}
        showSelect={true}
        saveItem={saveItem}
      />
    ),
    renderName,
    add: saveItem,
    datas: datas || []
  };

  return <ItemChooser {...updatedProps} />;
};

const WithQuery = (props: IProps) =>
  renderWithProps<IProps>(
    props,
    compose(
      graphql<IProps, ItemsQueryResponse, IFilterParams>(
        gql(props.options.queries.itemsQuery),
        {
          name: 'itemsQuery',
          options: ({ searchValue, stageId }) => {
            return {
              variables: {
                search: searchValue,
                stageId
              }
            };
          }
        }
      ),
      graphql<IProps, RelatedItemsQueryResponse, IFilterParams>(
        gql(props.options.queries.itemsQuery),
        {
          name: 'relatedItemsQuery',
          skip: ({ mainType, mainTypeId }) => !mainType && !mainTypeId,
          options: ({ searchValue, stageId }) => ({
            variables: {
              mainType: props.mainType,
              mainTypeId: props.mainTypeId,
              relType: props.options.type,
              isRelated: true,
              search: searchValue,
              stageId
            }
          })
        }
      ),
      graphql<IProps, SaveMutation, IItem>(
        gql(props.options.mutations.addMutation),
        {
          name: 'addMutation',
          options: ({ stageId }: { stageId?: string }) => {
            if (!stageId) {
              return {};
            }

            return {
              refetchQueries: [
                {
                  query: gql(queries.stageDetail),
                  variables: { _id: stageId }
                }
              ]
            };
          }
        }
      )
    )(ItemChooserContainer)
  );

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
  onSelect: (datas: IItem[]) => void;
  closeModal: () => void;
  // callback?: () => void;
};

export default class Wrapper extends React.Component<
  WrapperProps,
  {
    searchValue: string;
    mainTypeId?: string;
    mainType?: string;
    stageId?: string;
    pipelineId?: string;
    boardId?: string;
  }
> {
  constructor(props) {
    super(props);

    this.state = { searchValue: '', mainTypeId: '', mainType: '', stageId: '' };
  }

  search = value => {
    return this.setState({ searchValue: value });
  };

  filterStageId = stageId => {
    return this.setState({ stageId });
  };

  render() {
    const { searchValue, stageId } = this.state;

    return (
      <WithQuery
        {...this.props}
        search={this.search}
        searchValue={searchValue}
        filterStageId={this.filterStageId}
        stageId={stageId}
        mainTypeId={this.props.data.mainTypeId}
        mainType={this.props.data.mainType}
        options={this.props.data.options}
      />
    );
  }
}
