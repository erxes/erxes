import { IConversionStage } from "@erxes/ui-purchases/src/boards/types";
import * as React from "react";
import { Result } from "../style";
import Stage from "./Stage";

type Props = {
  stages: IConversionStage[];
};

class List extends React.Component<Props, {}> {
  calcSpace = (lenght: number, index: number) => {
    return 100 - (index * (100 / lenght)) / 1.5;
  };

  render() {
    const { stages } = this.props;

    const contents = stages.map((stage: IConversionStage, index: number) => (
      <Stage
        spacing={this.calcSpace(stages.length, index)}
        key={index}
        stage={stage}
      />
    ));

    return <>{contents}</>;
  }
}

export default List;
