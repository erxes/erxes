import React from 'react';
import FullCalendar from '@fullcalendar/react'; // must go before plugins
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
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
};
export class TimeView extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      selectedItem: null,
      closeTime: null,
      startTime: null
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

    let startDate;
    let endDate;

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
      </CalendarContainer>
    );
  }
}

export default TimeView;
