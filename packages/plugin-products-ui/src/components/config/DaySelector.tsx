import React, { useRef } from "react";
import { colors } from "@erxes/ui/src/styles";
import styled from "styled-components";
import styledTS from "styled-components-ts";
import Popover from "@erxes/ui/src/components/Popover";
import { Input } from "@erxes/ui/src/components/form/styles";

const ContainerWrapper = styledTS<{ column?: boolean }>(styled.div)`
    display: flex;
    flex-direction:${({ column }) => (column ? "column" : "row")};
    flex-wrap: wrap;
    max-width: 230px;
    gap: 5px;
    justify-content: center;
    margin:5px;

    > h5 {
        text-align: center;
        color: #888;
        display: block;
        margin-top: 10px;
        margin-bottom: 0;
        width: 100%;
    }

    > div {
        border-radius:5px;
        flex: 0 0 calc(14.28% - 20px);
        box-sizing: border-box; 
        cursor:pointer;
        text-align:center;
        padding: 5px 10px;

        &:hover {
            background-color: rgba(0,0,0,0.05);
        }

        &.active {
            background-color:${colors.colorPrimary};
            color:${colors.colorWhite}
        }
    }
    `;
type Props = {
  type: "monthly" | "weekly";
  onSelect: (value: string) => void;
  selectedValue: string;
};

const DayofWeek = ({ onSelect, selectedValue }: any) => {
  const DAYS_WEEK = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <ContainerWrapper column>
      <h5>{`Day of Week`}</h5>
      {DAYS_WEEK.map((day, index) => (
        <div
          key={index + 1}
          className={selectedValue === index + 1 ? "active" : ""}
          onClick={() => onSelect(index + 1)}
        >
          {day}
        </div>
      ))}
    </ContainerWrapper>
  );
};

const DayofMonth = ({ onSelect, selectedValue }: any) => {
  return (
    <ContainerWrapper>
      <h5>{`Day of Month`}</h5>
      {Array.from({ length: 31 }, (_, index) => (
        <div
          key={index + 1}
          className={selectedValue === index ? "active" : ""}
          onClick={() => onSelect(index)}
        >
          {index + 1}
        </div>
      ))}
    </ContainerWrapper>
  );
};

export const DaySelector = ({ type, ...props }: Props) => {
  let overlayTrigger = useRef(null);
  const renderContent = () => {
    switch (type) {
      case "monthly":
        return DayofMonth(props);
      case "weekly":
        return DayofWeek(props);

      default:
        return null;
    }
  };

  const trigger = (
    <Input placeholder="Select a day" value={props?.selectedValue} />
  );

  return (
    <Popover innerRef={overlayTrigger} trigger={trigger} placement="top-start">
      {renderContent()}
    </Popover>
  );
};
