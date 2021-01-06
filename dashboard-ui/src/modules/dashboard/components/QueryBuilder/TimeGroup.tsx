import { Menu } from 'antd';
import Icon from 'modules/common/components/Icon';
import { dateRanges } from 'modules/dashboard/constants';
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
  type
}) => {
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

  const dateRangeMenu = onClick => (
    <Menu>
      {dateRanges.map(m => (
        <Menu.Item key={m.title || m.value} onClick={() => onClick(m)}>
          {m.title || m.value}
        </Menu.Item>
      ))}
    </Menu>
  );

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
          {m.dateRange || 'All time'}
        </ButtonDropdown>,
        <strong key={`${m.dimension.name}-by`}>BY</strong>,
        <ButtonDropdown
          overlay={granularityMenu(m.dimension, granularity =>
            updateMethods.update(m, { ...m, granularity: granularity.name })
          )}
          key={`${m.dimension.name}-granularity`}
        >
          {m.dimension.granularities.find(g => g.name === m.granularity) &&
            m.dimension.granularities.find(g => g.name === m.granularity).title}
        </ButtonDropdown>
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
          type="dashed"
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
