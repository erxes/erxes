import FormControl from '@erxes/ui/src/components/form/Control';
import { Flex, Wrapper, LinkButton } from '@erxes/ui/src/styles/main';
import React from 'react';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Select from 'react-select-plus';
import Popover from 'react-bootstrap/Popover';
import styled from 'styled-components';

const timeTypes = [
  { label: 'Minutes', value: 'minutes' },
  { label: 'Hours', value: 'hours' },
  { label: 'Minutes', value: 'minute' },
];

const Container = styled(Flex)`
    gap: 15px;
    display: grid;
    grid-template-columns: 50% 50%;
}
`;

export function TimeSetter({
  input: { value, timeType = 'minute' },
  onChange,
}) {
  const OverLay = () => (
    <Popover id="help-popover">
      <Wrapper>
        <Container>
          <FormControl
            type="number"
            defaultValue={value}
            onChange={(e) =>
              onChange('value', (e.currentTarget as HTMLInputElement).value)
            }
          />
          <Select
            options={timeTypes}
            value={timeType}
            onChange={({ value }) => onChange('timeType', value)}
          />
        </Container>
      </Wrapper>
    </Popover>
  );

  const selectedTimeType =
    timeTypes.find(({ value }) => value === timeType) || timeTypes[1];

  return (
    <OverlayTrigger trigger="click" rootClose={true} overlay={OverLay()}>
      <LinkButton>{`${value || 0} ${selectedTimeType.label}`}</LinkButton>
    </OverlayTrigger>
  );
}
