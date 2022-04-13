import Tip from "@erxes/ui/src/components/Tip";
import * as React from "react";
import { Pin } from "../../styles";
import { ILocationOption } from "../../types";

type Props = {
  lat: number;
  lng: number;
  description?: any;
  color?: string;
  onChange?: (selectedOption: ILocationOption) => void;
};

class Marker extends React.Component<Props> {
  onClick = () => {
    const { lat, lng, description, onChange } = this.props;
    if (onChange) {
      onChange({ lat, lng, description });
    }
  };

  render() {
    const { description } = this.props;
    const backgroundColor = this.props.color || "#0008ff";

    return (
      <Tip text={description} placement="top">
        <Pin onClick={this.onClick} style={{ backgroundColor }} />
      </Tip>
    );
  }
}

export default Marker;
