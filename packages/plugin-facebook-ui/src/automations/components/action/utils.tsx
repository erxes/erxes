import FormControl from "@erxes/ui/src/components/form/Control";
import { Flex, Wrapper, LinkButton } from "@erxes/ui/src/styles/main";
import React from "react";
import Select from "react-select";
import Popover from "@erxes/ui/src/components/Popover";
import styled from "styled-components";

const timeTypes = [
  { label: "Minutes", value: "minutes" },
  { label: "Hours", value: "hours" },
  { label: "Days", value: "day" },
];

const Container = styled(Flex)`
    gap: 15px;
    display: grid;
    grid-template-columns: 50% 50%;
}
`;

export function TimeSetter({
  input: { value, timeType = "minute" },
  onChange,
}) {
  const selectedTimeType =
    timeTypes.find(({ value }) => value === timeType) || timeTypes[0];

  return (
    <Popover
      trigger={
        <LinkButton>{`${value || 0} ${selectedTimeType.label}`}</LinkButton>
      }
    >
      <Wrapper style={{ width: "250px" }}>
        <Container>
          <FormControl
            type="number"
            defaultValue={value || 0}
            onChange={(e) =>
              onChange("value", (e.currentTarget as HTMLInputElement).value)
            }
          />
          <Select
            options={timeTypes}
            value={timeTypes.find((o) => o.value === timeType) || timeTypes[0]}
            isClearable={true}
            onChange={({ value }: any) => onChange("timeType", value)}
          />
        </Container>
      </Wrapper>
    </Popover>
  );
}
