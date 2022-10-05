import React from 'react';
import { ITag } from '@erxes/ui-tags/src/types';
import { IOptions, IPipeline, IItem, ITimeData } from '../types';
import { CalendarContainer } from '../styles/view';
import EditForm from '../containers/editForm/EditForm';
import Timeline, {
  TimelineHeaders,
  SidebarHeader,
  DateHeader,
  TimelineMarkers,
  TodayMarker
} from 'react-calendar-timeline';
// make sure you include the timeline stylesheet or the timeline will not be styled
import 'react-calendar-timeline/lib/Timeline.css';
import moment from 'moment';
import { __ } from '@erxes/ui/src/utils';
import { Modal } from 'react-bootstrap';
import RTG from 'react-transition-group';
import AddForm from '../containers/portable/AddForm';

type Props = {
  tags: ITag[];
  pipeline: IPipeline;
  options: IOptions;
  refetch: () => void;
  items: IItem[];
  resources: any[];
  events: any[];
  itemMoveResizing: (itemId: string, data: ITimeData) => void;
};

type State = {
  selectedItem: any;
  closeTime: any;
  startTime: any;
  isModalOpen: boolean;
  groupId: string;
};
export class TimeView extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      selectedItem: null,
      closeTime: null,
      startTime: null,
      isModalOpen: false,
      groupId: ''
    };
  }

  onSelectItem = itemId => {
    this.setState({ selectedItem: itemId });
  };

  renderForm = () => {
    const { selectedItem } = this.state;
    const { options, refetch, items } = this.props;

    if (!selectedItem) {
      return null;
    }

    const dbDataRow = items.find(row => row._id === selectedItem);

    if (!dbDataRow || !dbDataRow.stage) {
      return null;
    }

    const beforePopupClose = () => {
      refetch();

      this.setState({ selectedItem: null });
    };

    return (
      <EditForm
        options={options}
        stageId={dbDataRow.stageId}
        itemId={dbDataRow._id}
        beforePopupClose={beforePopupClose}
        hideHeader={true}
        isPopupVisible={true}
      />
    );
  };

  handleItemResize = (itemId, time, edge) => {
    edge === 'right'
      ? this.props.itemMoveResizing(itemId, { closeDate: time })
      : this.props.itemMoveResizing(itemId, { startDate: time });
  };

  handleItemMove = (itemId, dragTime, newGroupOrder) => {
    const { resources, items } = this.props;

    const newTagId = [] as any;

    let startDate: any;
    let endDate: any;

    newTagId.push(resources[newGroupOrder].id);

    const filteredItem = items.find(item => (item || {})._id === itemId);

    if (filteredItem) {
      endDate = new Date(filteredItem.closeDate).getTime();
      startDate = new Date(filteredItem.startDate).getTime();
    }

    this.props.itemMoveResizing(itemId, {
      startDate: new Date(dragTime),
      tagId: newTagId,
      closeDate: dragTime + (endDate - startDate)
    });
  };

  addItem = (groupId, time, e) => {
    this.setState({ isModalOpen: true, groupId, startTime: time });
  };

  closeModal = () => {
    this.setState({ isModalOpen: false });
  };

  renderModal() {
    const { options, pipeline } = this.props;
    const { isModalOpen, groupId, startTime, closeTime } = this.state;

    const addText = options.texts.addText;

    const formProps = {
      options,
      showSelect: false,
      pipelineId: pipeline._id,
      tagIds: [groupId],
      startDate: new Date(startTime),
      closeDate: new Date(startTime + 3600000)
    };

    const content = props => <AddForm {...props} {...formProps} />;

    return (
      <Modal size="lg" show={isModalOpen} onHide={this.closeModal}>
        <Modal.Header closeButton={true}>
          <Modal.Title>{__(addText)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <RTG.Transition in={isModalOpen} timeout={300} unmountOnExit={true}>
            {content({ closeModal: this.closeModal })}
          </RTG.Transition>
        </Modal.Body>
      </Modal>
    );
  }

  render() {
    const { resources, events, refetch } = this.props;

    return (
      <CalendarContainer>
        <Timeline
          groups={resources}
          items={events}
          defaultTimeStart={moment().add(-12, 'hour')}
          defaultTimeEnd={moment().add(12, 'hour')}
          onItemResize={this.handleItemResize}
          onItemClick={this.onSelectItem}
          onItemMove={this.handleItemMove}
          onCanvasDoubleClick={this.addItem}
          canResize={'both'}
          refetch={refetch}
          stackItems
          dragSnap={1}
        >
          <TimelineHeaders className="sticky">
            <SidebarHeader>
              {({ getRootProps }) => {
                return (
                  <div {...getRootProps({ style: { color: '#fff' } })}>
                    By Tags
                  </div>
                );
              }}
            </SidebarHeader>
            <DateHeader unit="primaryHeader" />
            <DateHeader />
          </TimelineHeaders>
          <TimelineMarkers>
            <TodayMarker>
              {({ styles }) => {
                const customStyles = {
                  ...styles,
                  backgroundColor: 'red'
                };

                return <div style={customStyles} />;
              }}
            </TodayMarker>
          </TimelineMarkers>
        </Timeline>
        {this.renderForm()}
        {this.renderModal()}
      </CalendarContainer>
    );
  }
}

export default TimeView;
