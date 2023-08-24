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
import Modal from 'react-bootstrap/Modal';
import Table from '@erxes/ui/src/components/table';
import { Button, Alert } from '@erxes/ui/src';
import FormGroup from '@erxes/ui/src/components/form/Group';
import FormControl from '@erxes/ui/src/components/form/Control';
type Props = {
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
  renderModal: boolean;
  documents: any[];
  loading: boolean;
  checked: boolean;
  items: any[];
  selectedDocumentId: string;
  selectedDocumentName: string;
  copies: number;
  width: number;
};

export default class Stage extends React.Component<Props, State> {
  private bodyRef;
  private overlayTrigger;

  constructor(props: Props) {
    super(props);
    this.bodyRef = React.createRef();

    this.state = {
      showSortOptions: false,
      renderModal: false,
      documents: [],
      loading: false,
      checked: false,
      items: [],
      selectedDocumentId: '',
      selectedDocumentName: '',
      copies: 1,
      width: 300
    };
  }
  loadDocuments = () => {
    this.setState({ loading: true });

    client
      .mutate({
        mutation: gql(queries.documents),
        variables: { contentType: 'cards', subType: 'stageDeal' }
      })
      .then(({ data }) => {
        this.setState({
          documents: data.documents,
          loading: false
        });
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  };
  componentDidMount() {
    this.loadDocuments();
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
    const { showSortOptions, renderModal, selectedDocumentId } = this.state;

    if (
      showSortOptions !== nextState.showSortOptions ||
      renderModal !== nextState.renderModal ||
      selectedDocumentId !== nextState.selectedDocumentId ||
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

  toggleModal = () => {
    this.setState(prevState => ({
      renderModal: !prevState.renderModal
    }));
    this.onClosePopover();
  };

  onchangeDocument = (itemId, itemName) => {
    // Update the selectedDocumentId in the state
    this.setState({
      selectedDocumentId: itemId,
      selectedDocumentName: itemName
    });

    // Perform additional actions as needed based on the selected item
  };

  print = () => {
    const { items, selectedDocumentId, copies, width } = this.state;

    const apiUrl = getEnv().REACT_APP_API_URL; // Replace this with your API URL
    if (!selectedDocumentId) return Alert.error('Please select document !!!');
    try {
      const checkedItemIds = items
        .filter(item => item.checked) // Filter only checked items
        .map(item => item._id); // Map to an array of _id values
      if (checkedItemIds.length === 0) {
        return Alert.error('Please select item !!!');
      }

      const url = `${apiUrl}/pl:documents/print?_id=${selectedDocumentId}&itemIds=${checkedItemIds}&stageId=${this.props.stage._id}&copies=${copies}&width=${width}&contentype=cards:stage`;
      // Open the URL in a new browser window
      window.open(url);
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  onChangeCheckbox = (id: string, isChecked: boolean) => {
    const { items } = this.props;
    const changeItems = [...items];
    changeItems.map(item => {
      if (item._id === id) {
        item.checked = isChecked;
      }
    });
    this.setState({ items: changeItems });
  };

  renderPopover() {
    const { stage, options } = this.props;
    const { showSortOptions } = this.state;
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
                <li>
                  <a onClick={this.toggleModal}>{__('Print document')}</a>
                </li>
              )}
            </>
          )}
        </ActionList>
      </Popover>
    );
  }
  onChangeCopies = event => {
    this.setState({ copies: event });
  };
  onChangeWidth = event => {
    this.setState({ width: event });
  };

  renderDropdown() {
    const { selectedDocumentId, documents } = this.state;

    return (
      <Dropdown>
        <Dropdown.Toggle variant="success" id="dropdown-basic">
          {selectedDocumentId
            ? documents.find(item => item._id === selectedDocumentId)?.name ||
              'Select Document'
            : 'Select Document'}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {documents.map(item => (
            <Dropdown.Item
              key={item._id}
              onSelect={() => this.onchangeDocument(item._id, item.name)} // this.
            >
              {item.name}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
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

  renderModal() {
    const { renderModal } = this.state;
    const { items } = this.props;
    if (!renderModal) {
      return null;
    }
    return (
      <Modal
        centered
        show={renderModal}
        onHide={this.toggleModal}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>{__('Print document')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table>
            <thead>
              <tr>
                <th>{__('Name')}</th>
                <th>{__('Action')}</th>
              </tr>
            </thead>

            <tbody>
              {items.map(item => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={event =>
                        this.onChangeCheckbox(item._id, event.target.checked)
                      }
                    />
                  </td>
                </tr>
              ))}

              {/* <thead>
                <tr>
                  <td>
                    <FormGroup>
                      <FormControl
                        name='width'
                        type='number'
                        placeholder='Width'
                        // onChange={(event) =>
                        //   this.onChangeCheckbox(item._id, event.target.checked)
                        // }
                      />
                    </FormGroup>
                  </td>
                </tr>
              </thead> */}
              <tr>
                <td>
                  <input
                    type="number"
                    name="copies"
                    placeholder="Copies"
                    onChange={event => this.onChangeCopies(event.target.value)}
                  />
                </td>

                <td>
                  <input
                    type="number"
                    name="width"
                    placeholder="Width"
                    onChange={event => this.onChangeWidth(event.target.value)}
                  />
                </td>
              </tr>
              <tr></tr>
              <tr>
                <td colSpan={2}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end'
                    }}
                  >
                    {this.renderDropdown()}
                  </div>
                </td>
              </tr>
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button
            btnStyle="simple"
            size="small"
            icon="times-circle"
            onClick={this.toggleModal}
          >
            {__('Cancel')}
          </Button>
          <Button
            btnStyle="success"
            size="small"
            onClick={this.print}
            icon="checked-1"
          >
            {__('Save')}
          </Button>
        </Modal.Footer>
      </Modal>
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
                  {this.state.renderModal && this.renderModal()}
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
