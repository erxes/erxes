import React from "react";
import GoogleMapReact from "google-map-react";
import { colors } from "@erxes/ui/src/styles";
import { ILocationOption } from "../../types";
import Marker from "./Marker";

interface IMapControlOptions {
  controlSize: number;
  zoomControl: boolean;
  mapTypeControl: boolean;
  scaleControl: boolean;
  streetViewControl: boolean;
  rotateControl: boolean;
  fullscreenControl: boolean;
}

type Props = {
  googleMapApiKey: string;
  center: { lat: number; lng: number };
  locationOptions: ILocationOption[];
  defaultZoom: number;
  mapControlOptions: IMapControlOptions;
  onChangeMarker: (location: ILocationOption) => void;
  onClick: (location: ILocationOption) => any;
};

type State = {
  isMapDraggable: boolean;
  locationOptions: ILocationOption[];
  center: { lat: number; lng: number };
  mapSize: { width: number; height: number };
  mapStyle?: any;
};

export default class Map extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      isMapDraggable: true,
      center: props.center,
      locationOptions: props.locationOptions,
      mapSize: { width: 0, height: 0 },
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.locationOptions !== this.props.locationOptions) {
      this.setState({ locationOptions: nextProps.locationOptions });
    }

    if (nextProps.center !== this.props.center) {
      this.setState({ center: nextProps.center });
    }
  }

  render() {
    const {
      isMapDraggable,
      center,
      locationOptions,
      mapStyle,
      mapSize,
    } = this.state;
    const {
      mapControlOptions,
      defaultZoom,
      onChangeMarker,
      onClick,
    } = this.props;

    const onMarkerInteraction = (
      childKey: any,
      _childProps: any,
      mouse: any
    ) => {
      if (childKey !== "current") {
        return;
      }

      this.setState({
        isMapDraggable: false,
        center: { lat: mouse.lat, lng: mouse.lng },
      });
    };

    const onMarkerInteractionMouseUp = (
      childKey: any,
      _childProps: any,
      mouse: any
    ) => {
      if (childKey !== "current") {
        return;
      }

      const centerLocation = { lat: mouse.lat, lng: mouse.lng };

      this.setState({
        isMapDraggable: true,
        center: centerLocation,
      });
    };

    // const onClick = (e) => {
    //   if (locationOptions.length > 0) {
    //     return;
    //   }

    //   this.setState({ center: e });
    // };

    const onChangeMap = ({ size }) => {
      if (
        (size.width > mapSize.width || size.height > mapSize.height) &&
        mapSize.width > 0
      ) {
        // map enter fullscreen mode

        this.setState({
          mapStyle: {
            position: "fixed",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
          },
        });
      } else if (
        // map exit fullscreen mode

        mapSize.width > size.width ||
        mapSize.height > size.height
      ) {
        this.setState({ mapStyle: undefined });
      }
      this.setState({ mapSize: size });
    };

    return (
      <GoogleMapReact
        style={mapStyle}
        bootstrapURLKeys={{ key: this.props.googleMapApiKey }}
        draggable={isMapDraggable}
        center={center}
        defaultZoom={center.lat === 0 ? 0 : defaultZoom}
        options={mapControlOptions}
        onChildMouseDown={onMarkerInteraction}
        onChildMouseUp={onMarkerInteractionMouseUp}
        onChildMouseMove={onMarkerInteraction}
        onClick={onClick}
        onChange={onChangeMap}
      >
        {locationOptions.length > 0 ? (
          locationOptions.map((option, index) => (
            <Marker
              key={index}
              onChange={onChangeMarker}
              lat={option.lat}
              lng={option.lng}
              description={option.description}
              color={
                option.lat === center.lat && option.lng === center.lng
                  ? colors.colorCoreRed
                  : colors.colorSecondary
              }
            />
          ))
        ) : (
          <Marker
            key={"current"}
            onChange={onChangeMarker}
            lat={center.lat}
            lng={center.lng}
            description={"Your location"}
            color={colors.colorSecondary}
          />
        )}
      </GoogleMapReact>
    );
  }
}
