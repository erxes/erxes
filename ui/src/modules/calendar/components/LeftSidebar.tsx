import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import Sidebar from 'modules/layout/components/Sidebar';
import React from 'react';
import Select from 'react-select-plus';

type Props = {
  dateOnChange: (date: string | Date | undefined) => void;
  activeDate: Date;
  typeOnChange: ({ value, label }: { value: string; label: string }) => void;
  type: string;
};

class LeftSidebar extends React.Component<Props> {
  renderOptions = (list: string[]) => {
    return list.map(item => ({ value: item, label: item.toUpperCase() }));
  };

  render() {
    const { activeDate, dateOnChange, typeOnChange, type } = this.props;

    return (
      <Sidebar>
        <Select
          isRequired={true}
          value={type}
          onChange={typeOnChange}
          options={this.renderOptions(['day', 'week', 'month'])}
          clearable={false}
        />

        <br />

        <Datetime
          inputProps={{ placeholder: 'Click to select a date' }}
          dateFormat="YYYY/MM/DD"
          timeFormat="HH:mm"
          closeOnSelect={true}
          utc={true}
          input={false}
          value={activeDate}
          onChange={dateOnChange}
          defaultValue={dayjs()
            .startOf('day')
            .add(12, 'hour')
            .format('YYYY-MM-DD HH:mm:ss')}
        />
      </Sidebar>
    );
  }
}

export default LeftSidebar;
