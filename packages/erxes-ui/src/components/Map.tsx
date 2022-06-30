import { colors } from '@erxes/ui/src';
import GoogleMapReact from 'google-map-react';
import React from 'react';
import { ILocationOption } from '../types';
import Marker from './Marker';

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
  center: { lat: number; lng: number; description?: string };
  locationOptions: ILocationOption[];
  defaultZoom: number;
  mapControlOptions: IMapControlOptions;
  drawPolyLines?: boolean;
  isPreview?: boolean;
  onChangeMarker?: (location: ILocationOption) => void;
  onChangeLocationOptions?: (locationOptions: ILocationOption[]) => void;
};

type State = {
  isMapDraggable: boolean;
  locationOptions: ILocationOption[];
  center: { lat: number; lng: number; description?: string };
  mapSize: { width: number; height: number };
  mapStyle?: any;
  geodesicPolyline?: any;
  map?: any;
  maps?: any;
};

export default class Map extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const mapsURL = `https://maps.googleapis.com/maps/api/js?key=${props.googleMapApiKey}&libraries=geometry,places&language=en&v=quarterly`;
    const scripts: any = document.getElementsByTagName('script');
    let googleMapScript = document.createElement('script');
    // Go through existing script tags, and return google maps api tag when found.
    for (const script of scripts) {
      if (script.src.indexOf(mapsURL) === 0) {
        googleMapScript = script;
      }
    }

    googleMapScript.src = mapsURL;
    googleMapScript.async = true;
    googleMapScript.defer = true;
    window.document.body.appendChild(googleMapScript);

    googleMapScript.addEventListener('load', () => {
      console.log('MY MAP = ', (window as any).google);
      this.onLoadMaps(
        (window as any).google.maps.map,
        (window as any).google.maps
      );
    });

    this.state = {
      isMapDraggable: true,
      center: props.center,
      locationOptions: props.locationOptions || [],
      mapSize: { width: 0, height: 0 },
      geodesicPolyline: null
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.locationOptions !== this.props.locationOptions) {
      let { geodesicPolyline } = this.state;
      if (!geodesicPolyline) {
        return;
      }

      geodesicPolyline.setMap(null);

      geodesicPolyline = new this.state.maps.Polyline({
        path: nextProps.locationOptions,
        geodesic: true,
        strokeColor: '#e10031',
        strokeOpacity: 0.7,
        strokeWeight: 2
      });

      geodesicPolyline.setMap(this.state.map);

      this.setState({
        locationOptions: nextProps.locationOptions,
        geodesicPolyline
      });
    }

    if (nextProps.center !== this.props.center) {
      if (nextProps.center.lat === 0 && nextProps.center.lng === 0) {
        return;
      }

      this.setState({ center: nextProps.center });
    }
  }

  fitBounds(map, maps) {
    var bounds = new maps.LatLngBounds();
    for (let marker of this.props.locationOptions) {
      bounds.extend(new maps.LatLng(marker.lat, marker.lng));
    }
    map.fitBounds(bounds);
  }

  onLoadMaps(map, maps) {
    if (!map || !maps) {
      return;
    }
    console.log('MAP LOAD');
    const geodesicPolyline = new maps.Polyline({
      path: this.props.locationOptions,
      geodesic: true,
      strokeColor: '#e10031',
      strokeOpacity: 0.7,
      strokeWeight: 2
    });

    geodesicPolyline.setMap(map);

    this.setState({ map, maps, geodesicPolyline });
  }

  renderPolylines() {
    if (!this.props.drawPolyLines) {
      return;
    }

    const { map, maps, geodesicPolyline } = this.state;

    if (!map || !maps || !geodesicPolyline) {
      return;
    }

    this.fitBounds(map, maps);
  }

  render() {
    const {
      isMapDraggable,
      center,
      locationOptions,
      mapStyle,
      mapSize
    } = this.state;

    const {
      mapControlOptions,
      defaultZoom,
      onChangeMarker,
      onChangeLocationOptions
    } = this.props;

    const onMarkerInteraction = (
      childKey: any,
      _childProps: any,
      mouse: any
    ) => {
      if (!this.props.isPreview && childKey !== 'current') {
        return;
      }

      this.setState({
        isMapDraggable: false,
        center: { lat: mouse.lat, lng: mouse.lng }
      });
    };

    const onMarkerInteractionMouseUp = (
      childKey: any,
      _childProps: any,
      mouse: any
    ) => {
      if (!this.props.isPreview && childKey !== 'current') {
        return;
      }

      const index = Number(childKey);

      const option = locationOptions[index];
      locationOptions[index] = { ...option, lat: mouse.lat, lng: mouse.lng };

      if (onChangeLocationOptions) {
        onChangeLocationOptions(locationOptions);
      }

      this.setState({
        isMapDraggable: true,
        center: { lat: mouse.lat, lng: mouse.lng },
        locationOptions
      });
    };

    const onClick = e => {
      if (locationOptions.length > 0) {
        return;
      }

      this.setState({ center: e });
    };

    const onChangeMap = ({ size }) => {
      if (
        (size.width > mapSize.width || size.height > mapSize.height) &&
        mapSize.width > 0
      ) {
        // map enter fullscreen mode

        this.setState({
          mapStyle: {
            position: 'fixed',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%'
          }
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
      <>
        <GoogleMapReact
          style={mapStyle}
          draggable={isMapDraggable}
          center={center}
          defaultZoom={center.lat === 0 ? 0 : defaultZoom}
          options={mapControlOptions}
          onChildMouseDown={onMarkerInteraction}
          onChildMouseUp={onMarkerInteractionMouseUp}
          onChildMouseMove={onMarkerInteraction}
          onClick={onClick}
          onChange={onChangeMap}
          yesIWantToUseGoogleMapApiInternals={true}
          onGoogleApiLoaded={({ map, maps }) => this.onLoadMaps(map, maps)}
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
              key={'current'}
              onChange={onChangeMarker}
              lat={center.lat}
              lng={center.lng}
              description={center.description || 'Your location'}
              color={colors.colorSecondary}
            />
          )}
        </GoogleMapReact>
        {this.renderPolylines()}
      </>
    );
  }
}
