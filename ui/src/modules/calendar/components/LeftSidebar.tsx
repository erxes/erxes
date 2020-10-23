import Datetime from '@nateradebaugh/react-datetime';
import dayjs from 'dayjs';
import Label from 'modules/common/components/form/Label';
import Icon from 'modules/common/components/Icon';
import Sidebar from 'modules/layout/components/Sidebar';
import React from 'react';
import Select from 'react-select-plus';
import { CalendarController, SidebarWrapper } from '../styles';

type Props = {
  dateOnChange: (date: string | Date | undefined) => void;
  currentDate: Date;
  typeOnChange: ({ value, label }: { value: string; label: string }) => void;
  type: string;
};

class LeftSidebar extends React.Component<Props> {
  renderOptions = (list: string[]) => {
    return list.map(item => ({ value: item, label: item.toUpperCase() }));
  };

  onChange = (increment: boolean) => {
    const { currentDate, type, dateOnChange } = this.props;

    let date: any = currentDate;

    if (type === 'month') {
      const month = currentDate.getMonth();
      date = dayjs(currentDate).set('month', increment ? month + 1 : month - 1);
    }

    dateOnChange(new Date(date));
  };

  render() {
    const { currentDate, dateOnChange, typeOnChange, type } = this.props;

    return (
      <Sidebar>
        <SidebarWrapper>
          <CalendarController>
            <Icon icon="angle-left" onClick={() => this.onChange(false)} />
            <Icon icon="angle-right" onClick={() => this.onChange(true)} />
            <Label uppercase={true}>
              {dayjs(currentDate).format('MMMM, YYYY')}
            </Label>
          </CalendarController>

          <br />
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
            value={currentDate}
            onChange={dateOnChange}
            defaultValue={dayjs()
              .startOf('day')
              .add(12, 'hour')
              .format('YYYY-MM-DD HH:mm:ss')}
          />
        </SidebarWrapper>
      </Sidebar>
    );
  }
}

export default LeftSidebar;
