import {
  ActionButton,
  ActionList,
  AddNew,
  Body,
  Container,
  Header,
  Indicator,
  IndicatorItem,
  LoadingContent,
  StageFooter,
  StageRoot,
  StageTitle
} from '../../styles/stage';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Icon from '@erxes/ui/src/components/Icon';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { __ } from '@erxes/ui/src/utils/core';
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { AddForm } from '../../containers/portable';
import { IItem, IOptions, IStage } from '../../types';
import { renderAmount } from '../../utils';
import ItemList from '../stage/ItemList';
import { OverlayTrigger, Popover, Dropdown } from 'react-bootstrap';
import { Row } from '@erxes/ui-settings/src/styles';
import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';
import { queries } from '../../graphql';
import { getEnv } from '@erxes/ui/src/utils';
import { isEnabled } from '@erxes/ui/src/utils/core';
type Props = {
  item: any;
  loadingItems: () => boolean;
  removeStage: (stageId: string) => void;
  index: number;
  stage: IStage;
  length: number;
  items: any[];
  onAddItem: (stageId: string, item: IItem) => void;
  onRemoveItem: (itemId: string, stageId: string) => void;
  loadMore: () => void;
  options: IOptions;
  archiveItems: () => void;
  archiveList: () => void;
  sortItems: (type: string, description: string) => void;
};

type State = {
  showSortOptions: boolean;
  showPrintOptions: boolean;
  documents: any[];
  loading: boolean;
};

export default class Stage extends React.Component<Props, State> {
  private bodyRef;
  private overlayTrigger;

  constructor(props: Props) {
    super(props);
    this.bodyRef = React.createRef();

    this.state = {
      showSortOptions: false,
      showPrintOptions: false,
      documents: [],
      loading: false
    };
  }
  loadDocuments = () => {
    this.setState({ loading: true });

    client
      .mutate({
        mutation: gql(queries.documents),
        variables: { contentType: 'cards:stage' }
      })
      .then(({ data }) => {
        this.setState({ documents: data.documents });
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };
  componentDidMount() {
    // Load items until scroll created
    const handle = setInterval(() => {
      if (this.props.loadingItems()) {
        return;
      }

      const { current } = this.bodyRef;

      if (!current) {
        return;
      }

      const isScrolled = current.scrollHeight > current.clientHeight;

      if (isScrolled) {
        return clearInterval(handle);
      }

      const { items, stage } = this.props;

      if (items.length < stage.itemsTotalCount) {
        return this.props.loadMore();
      } else {
        return clearInterval(handle);
      }
    }, 1000);
  }

  shouldComponentUpdate(nextProps: Props, nextState: State) {
    const { stage, index, length, items, loadingItems } = this.props;
    const { showSortOptions, showPrintOptions } = this.state;

    if (
      showSortOptions !== nextState.showSortOptions ||
      showPrintOptions !== nextState.showPrintOptions ||
      index !== nextProps.index ||
      loadingItems() !== nextProps.loadingItems() ||
      length !== nextProps.length ||
      JSON.stringify(stage) !== JSON.stringify(nextProps.stage) ||
      JSON.stringify(items) !== JSON.stringify(nextProps.items)
    ) {
      return true;
    }

    return false;
  }

  onClosePopover = () => {
    this.overlayTrigger.hide();
  };

  toggleSortOptions = () => {
    const { showSortOptions } = this.state;

    this.setState({ showSortOptions: !showSortOptions });
  };

  togglePrintOptions = () => {
    this.setState(prevState => ({
      showPrintOptions: !prevState.showPrintOptions
    }));
  };

  print = _id => {
    const { items } = this.props;
    try {
      const itemsArray = items as any[];

      const groupedData: Record<string, any> = {};
      itemsArray.forEach(item => {
        const stageId = item.stage._id;
        const stageItems = itemsArray.filter(
          item => item.stage._id === stageId
        );

        const combinedNames = stageItems.map(item => item.name).join(',');

        if (!groupedData[stageId]) {
          groupedData[stageId] = {
            stage: {
              ...item.stage,
              status: 'active',
              order: item.stage.order + 1,
              type: item.stage.type
            },
            amount: {
              AED: 0
            },
            assignedUsers: item.assignedUsers,
            companies: item.companies,
            createdAt: item.createdAt,
            customers: item.customers,
            hasNotified: item.hasNotified,
            isComplete: item.isComplete,
            isWatched: item.isWatched,
            labels: item.labels,
            modifiedAt: item.modifiedAt,
            name: combinedNames,
            products: [],
            status: item.status,
            tagIds: item.tagIds,
            unUsedAmount: item.unUsedAmount,
            __typename: item.__typename,
            _id: item._id
          };
        }

        if (item.products) {
          item.products.forEach(product => {
            const existingProduct = groupedData[stageId].products.find(
              p => p.productId === product.productId
            );

            if (existingProduct) {
              existingProduct.quantity += product.quantity;
              existingProduct.amount += product.amount;
              existingProduct.discount += product.discount;
              existingProduct.discountPercent += product.discountPercent;
              existingProduct.globalUnitPrice += product.globalUnitPrice;
              existingProduct.maxQuantity += product.maxQuantity;
            } else {
              groupedData[stageId].products.push({
                productId: product.productId,
                amount: product.amount,
                discount: product.discount,
                discountPercent: product.discountPercent,
                globalUnitPrice: product.globalUnitPrice,
                maxQuantity: product.maxQuantity,
                quantity: product.quantity
              });
            }

            // Update the total amount
            groupedData[stageId].amount.AED +=
              product.amount * product.quantity;
          });
        }
      });

      const extractedResults = Object.values(groupedData);

      if (extractedResults.length > 0) {
        const data = extractedResults[0];
        const url = `${
          getEnv().REACT_APP_API_URL
        }/pl:documents/print?_id=${_id}&itemId=${data._id}&stageId=${
          data.stage._id
        }`;
        window.open(url);
      } else {
        return { error: 'No data available.' };
      }
    } catch (error) {
      return { error: error.message };
    }
  };

  renderPopover() {
    const { stage, options } = this.props;
    const { showSortOptions, showPrintOptions } = this.state;
    const archiveList = () => {
      this.props.archiveList();
      this.onClosePopover();
    };

    const archiveItems = () => {
      this.props.archiveItems();
      this.onClosePopover();
    };

    const removeStage = () => {
      this.props.removeStage(stage._id);
      this.onClosePopover();
    };

    return (
      <Popover id="stage-popover">
        <ActionList>
          {showSortOptions ? (
            this.renderSortOptions()
          ) : showPrintOptions ? (
            this.renderPrintOptions()
          ) : (
            <>
              <li onClick={archiveItems} key="archive-items">
                {__('Archive All Cards in This List')}
              </li>
              <li onClick={archiveList} key="archive-list">
                {__('Archive This List')}
              </li>
              <li onClick={removeStage} key="remove-stage">
                {__('Remove stage')}
              </li>
              <Dropdown.Divider />
              <li onClick={this.toggleSortOptions}>{__('Sort By')}</li>
              {isEnabled('documents') && options.type === 'deal' && (
                <>
                  {this.loadDocuments()}
                  <li onClick={this.togglePrintOptions}>
                    {__('Print document')}
                  </li>
                </>
              )}
            </>
          )}
        </ActionList>
      </Popover>
    );
  }

  renderPrintOptions() {
    const { showPrintOptions, documents } = this.state;
    if (!showPrintOptions) {
      return null;
    }
    return (
      <>
        <li onClick={this.togglePrintOptions}>Back</li>
        <Dropdown.Divider />
        {documents.map(item => (
          <li key={item._id} onClick={() => this.print(item._id)}>
            {item.name}
          </li>
        ))}
      </>
    );
  }

  renderCtrl() {
    return (
      <OverlayTrigger
        ref={overlayTrigger => {
          this.overlayTrigger = overlayTrigger;
        }}
        trigger="click"
        placement="bottom-start"
        rootClose={true}
        container={this}
        overlay={this.renderPopover()}
      >
        <ActionButton>
          <Icon icon="ellipsis-h" />
        </ActionButton>
      </OverlayTrigger>
    );
  }

  renderSortOptions() {
    const { showSortOptions } = this.state;

    if (!showSortOptions) {
      return null;
    }

    const sortItems = (type: string, description: string) => {
      this.props.sortItems(type, description);
      this.onClosePopover();
    };

    return (
      <>
        <li onClick={this.toggleSortOptions}>Back</li>

        <Dropdown.Divider />

        <li
          onClick={sortItems.bind(
            this,
            'created-desc',
            'date created (newest first)'
          )}
        >
          Date created (Newest first)
        </li>
        <li
          onClick={sortItems.bind(
            this,
            'created-asc',
            'date created (oldest first)'
          )}
        >
          Date created (Oldest first)
        </li>
        <li
          onClick={sortItems.bind(
            this,
            'modified-desc',
            'date modified (newest first)'
          )}
        >
          Date modified (Newest first)
        </li>
        <li
          onClick={sortItems.bind(
            this,
            'modified-asc',
            'date modified (oldest first)'
          )}
        >
          Date modified (Oldest first)
        </li>
        <li
          onClick={sortItems.bind(
            this,
            'close-asc',
            'date assigned (Earliest first)'
          )}
        >
          Date assigned (Earliest first)
        </li>
        <li
          onClick={sortItems.bind(
            this,
            'close-desc',
            'date assigned (Latest first)'
          )}
        >
          Date assigned (Latest first)
        </li>
        <li
          onClick={sortItems.bind(this, 'alphabetically-asc', 'alphabetically')}
        >
          Alphabetically
        </li>
      </>
    );
  }

  onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const bottom =
      Math.floor(target.scrollHeight - target.scrollTop) <= target.clientHeight;

    if (bottom) {
      this.props.loadMore();
    }
  };

  renderAddItemTrigger() {
    const { options, stage, onAddItem } = this.props;
    const addText = options.texts.addText;

    const trigger = (
      <StageFooter>
        <AddNew>
          <Icon icon="plus-1" />
          {__(addText)}
        </AddNew>
      </StageFooter>
    );

    const formProps = {
      options,
      showSelect: false,
      callback: (item: IItem) => onAddItem(stage._id, item),
      stageId: stage._id,
      pipelineId: stage.pipelineId,
      aboveItemId: ''
    };

    const content = props => <AddForm {...props} {...formProps} />;

    return <ModalTrigger title={addText} trigger={trigger} content={content} />;
  }

  renderIndicator() {
    const index = this.props.index || 0;
    const length = this.props.length || 0;

    const data: any = [];

    for (let i = 0; i < length; i++) {
      data.push(<IndicatorItem isPass={index >= i} key={i} />);
    }

    return data;
  }

  renderItemList() {
    const { stage, items, loadingItems, options, onRemoveItem } = this.props;

    if (loadingItems()) {
      return (
        <LoadingContent>
          <img alt="Loading" src="/images/loading-content.gif" />
        </LoadingContent>
      );
    }

    return (
      <ItemList
        listId={stage._id}
        stageId={stage._id}
        stageAge={stage.age}
        items={items}
        options={options}
        onRemoveItem={onRemoveItem}
      />
    );
  }

  render() {
    const { index, stage } = this.props;

    if (!stage) {
      return <EmptyState icon="columns-1" text="No stage" size="small" />;
    }

    return (
      <Draggable draggableId={stage._id} index={index}>
        {(provided, snapshot) => (
          <Container innerRef={provided.innerRef} {...provided.draggableProps}>
            <StageRoot isDragging={snapshot.isDragging}>
              <Header {...provided.dragHandleProps}>
                <StageTitle>
                  <div>
                    {stage.name}
                    <span>{stage.itemsTotalCount}</span>
                  </div>
                  {this.renderCtrl()}
                </StageTitle>
                <Row>
                  {renderAmount(stage.amount)}
                  {renderAmount(stage.unUsedAmount, false)}
                </Row>
                <Indicator>{this.renderIndicator()}</Indicator>
              </Header>
              <Body innerRef={this.bodyRef} onScroll={this.onScroll}>
                {this.renderItemList()}
              </Body>
              {this.renderAddItemTrigger()}
            </StageRoot>
          </Container>
        )}
      </Draggable>
    );
  }
}
