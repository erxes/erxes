import React from 'react';
import FullCalendar from '@fullcalendar/react'; // must go before plugins
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { ITag } from '@erxes/ui-tags/src/types';
import { IOptions, IPipeline, IItem } from '../types';
import { CalendarContainer } from '../styles/view';
import EditForm from '../containers/editForm/EditForm';
import Timeline, {
  TimelineHeaders,
  SidebarHeader,
  DateHeader
} from 'react-calendar-timeline';
// make sure you include the timeline stylesheet or the timeline will not be styled
import 'react-calendar-timeline/lib/Timeline.css';
import moment from 'moment';

type Props = {
  tags: ITag[];
  dealsTotalCount: number;
  pipeline: IPipeline;
  options: IOptions;
  refetch: () => void;
  items: IItem[];
  resources: any[];
  events: any[];
};

type State = {
  selectedItem: any;
};
export class TimeView extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      selectedItem: null
    };
  }

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
    const { items } = this.props;
    console.log(itemId, time, edge, '--------------');
    items.map(item =>
      item._id === itemId
        ? Object.assign({}, item, {
            startDate: edge === 'left' ? time : item.startDate,
            closeDate: edge === 'right' ? item.closeDate : time
          })
        : item
    );
  };

  handleItemMove = (itemId, dragTime, newGroupOrder) => {
    console.log(itemId, dragTime, newGroupOrder, '----------------------');
  };

  onSelectItem = itemId => {
    this.setState({ selectedItem: itemId });
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
        >
          <TimelineHeaders className="sticky">
            <SidebarHeader>
              {({ getRootProps }) => {
                return <div {...getRootProps()}>Tags</div>;
              }}
            </SidebarHeader>
            <DateHeader unit="primaryHeader" />
            <DateHeader />
          </TimelineHeaders>
        </Timeline>
        {this.renderForm()}
      </CalendarContainer>
    );
  }
}

export default TimeView;
