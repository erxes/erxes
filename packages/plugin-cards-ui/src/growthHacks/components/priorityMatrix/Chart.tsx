import { __ } from "@erxes/ui/src/utils/core";
import { RightContent } from "../../styles";
import React from "react";
import Popover from "@erxes/ui/src/components/Popover";
import {
  AxisX,
  AxisY,
  ChartAxis,
  ChartLegends,
  ExperimentList,
  Point,
} from "./styles";
import { PopoverContent } from "@erxes/ui/src/components/filterableList/styles";

type Props = {
  datas: any[];
};

class Chart extends React.PureComponent<Props> {
  renderPoint = (data) => {
    if (data.count === 1) {
      return (
        <Point key={Math.random()} x={data.x} y={data.y}>
          <span>{data.names[0]}</span>
        </Point>
      );
    }

    return (
      <Popover
        trigger={
          <Point x={data.x} y={data.y}>
            <span>{`(${data.count}) Experiments`}</span>
          </Point>
        }
        placement="auto"
      >
        <h3>{__("Experiment names")}</h3>
        <PopoverContent>
          <ExperimentList>
            {data.names.map((name, index) => (
              <li key={index}>{name}</li>
            ))}
          </ExperimentList>
        </PopoverContent>
      </Popover>
    );
  };

  render() {
    return (
      <RightContent>
        <ChartAxis>
          {this.props.datas.map((data) => this.renderPoint(data))}

          <ChartLegends>
            <span className="top-left">{__("Big Bets")}</span>
            <span className="top-right">{__("Quick Wins")}</span>
            <span className="bottom-left">{__("Time Sinks")}</span>
            <span className="bottom-right">{__("Maybes")}</span>
          </ChartLegends>

          <AxisY>{__("Impact")}</AxisY>
          <AxisX>{__("Effort")}</AxisX>
        </ChartAxis>
      </RightContent>
    );
  }
}

export default Chart;
