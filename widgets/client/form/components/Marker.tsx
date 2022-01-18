import * as React from 'react';
import { ILocationOption } from '../types';

type Props = {
  color?: string;
  lat: number;
  lng: number;
  description?: any;
  onChange?: (selectedOption: ILocationOption) => void;
  selectedOption?: ILocationOption;
};

class Marker extends React.Component<Props> {
  onClick = () => {
    const { lat, lng, description, onChange } = this.props;
    if (onChange) {
      onChange({ lat, lng, description });
    }
  };

  render() {
    const { description, selectedOption, lat, lng } = this.props;
    let backgroundColor = this.props.color || '#0008ff';

    if (selectedOption) {
      if (selectedOption.lat === lat && selectedOption.lng === lng) {
        backgroundColor = '#ff4000';
      }
    }

    return (
      <div className="erxes-tooltip" data-tooltip={description}>
        <div
          onClick={this.onClick}
          className="erxes-pin"
          style={{ backgroundColor }}
        />
      </div>
    );
  }
}

export default Marker;
