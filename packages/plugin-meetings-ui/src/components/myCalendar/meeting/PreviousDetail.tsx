import React from 'react';
import { IMeeting } from '../../../types';
import Select from 'react-select-plus';
import moment from 'moment';
import Detail from '../../../containers/myCalendar/meeting/Detail';
import { FeatureRowItem } from '../../../styles';
import { EmptyState } from '@erxes/ui/src/components';

type Props = {
  meetings: IMeeting[];
  queryParams: any;
};

type State = {
  selectedMeetingId: string;
};

class PreviousDetailComponents extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { selectedMeetingId: props.meetings?.[0]?._id || '' };
  }

  render() {
    const { meetings, queryParams } = this.props;
    const { selectedMeetingId } = this.state;

    const selectedValues =
      meetings?.map(({ _id, startDate }) => ({
        value: _id,
        label: moment(startDate || '').format('ddd, MMMM DD, YYYY • HH:mm a')
      })) || {};

    const onSelect = ({ value }) => {
      this.setState({ selectedMeetingId: value });
    };
    return (
      <>
        <FeatureRowItem>
          <Select
            placeholder={'Choose times'}
            value={selectedMeetingId}
            options={selectedValues}
            onChange={onSelect}
          />
        </FeatureRowItem>

        {selectedMeetingId ? (
          <Detail queryParams={queryParams} meetingId={selectedMeetingId} />
        ) : (
          <EmptyState text={`Empty meeting`} icon="clipboard-blank" />
        )}
      </>
    );
  }
}

export default PreviousDetailComponents;
