import React from 'react';
import FullCalendar from '@fullcalendar/react'; // must go before plugins
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import { ITag } from '@erxes/ui-tags/src/types';
import { IOptions, IPipeline, IItem } from '../types';
import { CalendarContainer } from '../styles/view';
import EditForm from '../containers/editForm/EditForm';

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

  render() {
    const { resources, events } = this.props;

    const onSelectItem = item => {
      this.setState({
        selectedItem: item.event._def.extendedProps.item
      });
    };

    return (
      <CalendarContainer>
        <FullCalendar
          plugins={[resourceTimelinePlugin]}
          timeZone="UTC"
          aspectRatio={1.5}
          initialView="resourceTimelineMonth"
          schedulerLicenseKey="CC-Attribution-NonCommercial-NoDerivatives"
          headerToolbar={{
            left: 'prev, next',
            center: 'title',
            right:
              'resourceTimelineDay, resourceTimelineWeek, resourceTimelineMonth, resourceTimelineYear'
          }}
          resourceAreaHeaderContent="Tags"
          resourceAreaWidth={'15%'}
          height="auto"
          resources={resources}
          events={events}
          eventClick={onSelectItem}
          editable={true}
        />
        {this.renderForm()}
      </CalendarContainer>
    );
  }
}

export default TimeView;
