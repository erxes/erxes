import { DatePicker, Menu } from 'antd';
import Icon from 'modules/common/components/Icon';
import { dateRanges, propertyTypes } from 'modules/dashboard/constants';
import moment from 'moment';
import React from 'react';
import { TimesWrapper } from '../styles';
import ButtonDropdown from './ButtonDropdown';
import MemberDropdown from './MemberDropdown';
import RemoveButtonGroup from './RemoveButtonGroup';

const TimeGroup = ({
  members,
  availableMembers,
  addMemberName,
  updateMethods,
  type,
  setIsDateRange,
  isDateRange
}) => {
  const onDateRangeChange = (dateSring, m) => {
    updateMethods.update(m, { ...m, dateRange: dateSring });
  };

  const granularityMenu = (member, onClick) => (
    <Menu>
      {member.granularities.length ? (
        member.granularities.map(m => (
          <Menu.Item key={m.title} onClick={() => onClick(m)}>
            {m.title}
          </Menu.Item>
        ))
      ) : (
        <Menu.Item disabled={true}>No members found</Menu.Item>
      )}
    </Menu>
  );

  const dateRangeMenu = choose => {
    const onClick = m => {
      if (m.title === 'Date range') {
        return setIsDateRange(true);
      } else {
        setIsDateRange(false);
        return choose(m);
      }
    };

    return (
      <Menu>
        {dateRanges.map(m => (
          <Menu.Item key={m.title || m.value} onClick={() => onClick(m)}>
            {m.title || m.value}
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  const renderDateRange = m => {
    if (!propertyTypes.includes(type || '')) {
      return (
        <>
          <strong key={`${m.dimension.name}-by`}>BY</strong>
          <ButtonDropdown
            overlay={granularityMenu(m.dimension, granularity =>
              updateMethods.update(m, { ...m, granularity: granularity.name })
            )}
            key={`${m.dimension.name}-granularity`}
          >
            {m.dimension.granularities.find(g => g.name === m.granularity) &&
              m.dimension.granularities.find(g => g.name === m.granularity)
                .title}
          </ButtonDropdown>
        </>
      );
    }
    return;
  };

  const renderValue = value => {
    if (isDateRange) {
      return 'Date range';
    }

    return value || 'All time';
  };

  const renderDateRangeValue = (dateRange, index) => {
    if (Array.isArray(dateRange)) {
      return moment(dateRange[index] || "2017/05/13", 'YYYY/MM/DD');
    }

    return moment().add(index, 'days')
  }


  const renderDatePicker = m => {
    if (isDateRange) {
      return (
        <DatePicker.RangePicker
          key={`${m.dimension.name}-date-range-picker`}
          style={{ borderRadius: '16px', marginLeft: '10px' }}
          onChange={(date, dateString) => onDateRangeChange(dateString, m)}
          defaultValue={[
            renderDateRangeValue(m.dateRange, 0),
            renderDateRangeValue(m.dateRange, 1)
          ]}
        />
      );
    }

    return;
  };

  return (
    <TimesWrapper>
      {members.map(m => [
        <RemoveButtonGroup
          onRemoveClick={() => updateMethods.remove(m)}
          key={`${m.dimension.name}-member`}
        >
          <MemberDropdown
            onClick={updateWith =>
              updateMethods.update(m, { ...m, dimension: updateWith })
            }
            availableMembers={availableMembers}
            schemaType={type}
            addMemberName={addMemberName}
          >
            {m.dimension.shortTitle}
          </MemberDropdown>
        </RemoveButtonGroup>,
        <strong key={`${m.dimension.name}-for`}>FOR</strong>,

        <ButtonDropdown
          overlay={dateRangeMenu(dateRange =>
            updateMethods.update(m, { ...m, dateRange: dateRange.value })
          )}
          key={`${m.dimension.name}-date-range`}
        >
          {renderValue(m.dateRange)}
        </ButtonDropdown>,

        renderDatePicker(m),
        renderDateRange(m)
      ])}
      {!members.length && (
        <MemberDropdown
          onClick={member =>
            updateMethods.add({
              dimension: member,
              granularity: 'day'
            })
          }
          availableMembers={availableMembers}
          icon={<Icon icon="plus-1" />}
          schemaType={type}
          addMemberName={addMemberName}
        >
          {addMemberName}
        </MemberDropdown>
      )}
    </TimesWrapper>
  );
};

export default TimeGroup;
