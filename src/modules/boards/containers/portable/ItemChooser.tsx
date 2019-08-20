import gql from 'graphql-tag';
// import Chooser from 'modules/common/components/Chooser';
import { Alert, renderWithProps } from 'modules/common/utils';

// import { mutations } from 'modules/conformity/graphql';
// import {
//   CreateConformityMutation,
//   IConformityDoc
// } from 'modules/conformity/types';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import AddForm from '../../components/portable/AddForm';
import ItemChooser from '../../components/portable/ItemChooser';
// import { queries } from '../../graphql';
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
  options: IOptions;
  mainType?: string;
  mainTypeId?: string;
  // boardId?: string;
  // pipelineId?: string;
  // stageId?: string;
  showSelect?: boolean;
};

type FinalProps = {
  itemsQuery: ItemsQueryResponse;
  relatedItemsQuery: RelatedItemsQueryResponse;
  addMutation: SaveMutation;
} & IProps;

const ItemChooserContainer = (props: WrapperProps & FinalProps) => {
  const {
    data,
    itemsQuery,
    relatedItemsQuery
    // saveMutation,
  } = props;

  const saveItem = (doc: IItemParams, callback: (item: IItem) => void) => {
    const { addMutation } = props;

    addMutation({ variables: doc })
      .then(({ resData }) => {
        Alert.success(data.options.texts.addSuccessText);
        callback(resData[data.options.mutationsName.addMutation]);
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const renderName = item => {
    return item.name || 'Unknown';
  };

  const datas =
    data.mainTypeId && data.mainType
      ? relatedItemsQuery[data.options.queriesName.itemsQuery]
      : itemsQuery[data.options.queriesName.itemsQuery];

  const updatedProps = {
    ...props,
    data: {
      _id: data._id,
      name: renderName(data),
      datas: data.items,
      mainTypeId: data.mainTypeId,
      mainType: data.mainType
    },
    title: data.options.title,
    renderForm: formProps => <AddForm {...formProps} action={saveItem} />,
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
          name: 'itemsQuery'
        }
      ),
      graphql<IProps, RelatedItemsQueryResponse, IFilterParams>(
        gql(props.options.queries.itemsQuery),
        {
          name: 'relatedItemsQuery',
          skip: ({ mainType, mainTypeId }) => !mainType && !mainTypeId,
          options: () => ({
            variables: {
              mainType: props.mainType,
              mainTypeId: props.mainTypeId,
              relType: props.options.type,
              isRelated: true
            }
          })
        }
      )
      // graphql<IProps, SaveMutation, IItem>(
      //   gql(props.options.mutations.addMutation),
      //   {
      //     name: 'addMutation',
      //     options: ({ stageId }: { stageId?: string }) => {
      //       if (!stageId) {
      //         return {};
      //       }

      //       return {
      //         refetchQueries: [
      //           {
      //             query: gql(queries.stageDetail),
      //             variables: { _id: stageId }
      //           }
      //         ]
      //       };
      //     }
      //   }
      // ),
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
  };
  showSelect?: boolean;
  onSelect: (datas: IItem[]) => void;
  closeModal: () => void;
  callback?: () => void;
};

export default class Wrapper extends React.Component<
  WrapperProps,
  {
    perPage: number;
    searchValue: string;
    mainTypeId?: string;
    mainType?: string;
  }
> {
  constructor(props) {
    super(props);

    this.state = { perPage: 20, searchValue: '', mainTypeId: '', mainType: '' };
  }

  render() {
    return (
      <WithQuery
        {...this.props}
        mainTypeId={this.props.data.mainTypeId}
        mainType={this.props.data.mainType}
        options={this.props.data.options}
      />
    );
  }
}
