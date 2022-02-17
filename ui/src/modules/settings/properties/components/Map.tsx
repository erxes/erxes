import React, { useState, useRef, useEffect } from 'react';

declare const google;

type Props = {
  mapType: string;
  mapTypeControl?: boolean;
};

interface IMarker {
  address: string;
  latitude: number;
  longitude: number;
}

type GoogleLatLng = google.maps.LatLng;
type GoogleMap = google.maps.Map;
type GoogleMarker = google.maps.Marker;
type GooglePolyline = google.maps.Polyline;

const Map = (props: Props) => {
  const { mapType, mapTypeControl } = props;

  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<GoogleMap | undefined>(undefined);
  const [marker, setMarker] = useState<IMarker | undefined>(undefined);
  const [homeMarker, setHomeMarker] = useState<GoogleMarker | undefined>(
    undefined
  );
  const [googleMarkers, setGoogleMarkers] = useState<GoogleMarker[]>([]);
  const [listenerIdArray, setListenerIdArray] = useState<any[]>([]);
  const [LastLineHook, setLastLineHook] = useState<GooglePolyline | undefined>(
    undefined
  );

  const startMap = (): void => {
    if (!map) {
      defaultMapStart();
    } else {
      const homeLocation = new google.maps.LatLng(65.166013499, 13.3698147);
      setHomeMarker(addHomeMarker(homeLocation));
    }
  };
  useEffect(startMap, [map]);

  const defaultMapStart = (): void => {
    const defaultAddress = new google.maps.LatLng(
      47.92167799763411,
      106.9175921685701
    );
    initMap(4, defaultAddress);
  };

  const initEventListener = (): void => {
    if (map) {
      google.maps.event.addListener(map, 'click', (e: any) => {
        coordinateToAddress(e.latLng);
      });
    }
  };
  useEffect(initEventListener, [map]);

  const coordinateToAddress = async (coordinate: GoogleLatLng) => {
    const geocoder = new google.maps.Geocoder();
    await geocoder.geocode({ location: coordinate }, (results, status) => {
      if (status === 'OK' && results) {
        setMarker({
          address: results[0].formatted_address,
          latitude: coordinate.lat(),
          longitude: coordinate.lng()
        });
      }
    });
  };

  useEffect(() => {
    if (marker) {
      addMarker(new google.maps.LatLng(marker.latitude, marker.longitude));
    }
  }, [marker]);

  const addMarker = (location: GoogleLatLng): void => {
    const newMarker: GoogleMarker = new google.maps.Marker({
      position: location,
      map,
      icon: getIconAttributes('#000000')
    });

    setGoogleMarkers([...googleMarkers, newMarker]);

    const listenerId = newMarker.addListener('click', () => {
      const homePos = homeMarker && homeMarker.getPosition();
      const markerPos = newMarker.getPosition();
      if (homePos && markerPos) {
        if (LastLineHook) {
          LastLineHook.setMap(null);
        }

        const line = new google.maps.Polyline({
          path: [
            { lat: homePos.lat(), lng: homePos.lng() },
            { lat: markerPos.lat(), lng: markerPos.lng() }
          ],
          icons: [
            {
              icon: {
                path: google.maps.SymbolPath.FORWARD_OPEN_ARROW
              },
              offset: '100%'
            }
          ],
          map
        });

        setLastLineHook(line);
      }
    });

    setListenerIdArray([...listenerIdArray, listenerId]);
  };

  useEffect(() => {
    listenerIdArray.forEach(listenerId => {
      google.maps.event.removeListener(listenerId);
    });

    setListenerIdArray([]);
    setGoogleMarkers([]);
    googleMarkers.forEach(googleMarker => {
      const markerPosition = googleMarker.getPosition();
      if (markerPosition) {
        addMarker(markerPosition);
      }
    });
  }, [LastLineHook]);

  const addHomeMarker = (location: GoogleLatLng): GoogleMarker => {
    const homeMarkerConst: GoogleMarker = new google.maps.Marker({
      position: location,
      map,
      icon: {
        url: window.location.origin + '/assets/images/homeAddressMarker.png'
      }
    });

    if (map) {
      homeMarkerConst.addListener('click', () => {
        map.panTo(location);
        map.setZoom(6);
      });
    }

    return homeMarkerConst;
  };

  const getIconAttributes = (iconColor: string) => {
    return {
      path:
        'M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z',
      fillColor: iconColor,
      fillOpacity: 1,
      anchor: new google.maps.Point(9, 26),
      strokeWeight: 1,
      strokeColor: '#ffffff',
      scale: 2
    };
  };

  const initMap = (zoomLevel: number, address: GoogleLatLng): void => {
    console.log('address: ', address.lat(), address.lng());
    if (ref.current) {
      const m = new google.maps.Map(ref.current, {
        zoom: zoomLevel,
        center: address,
        mapTypeControl,
        streetViewControl: false,
        rotateControl: false,
        scaleControl: true,
        fullscreenControl: true,
        panControl: true,
        zoomControl: true,
        gestureHandling: 'cooperative',
        mapTypeId: mapType,
        draggableCursor: 'pointer'
      });

      console.log(m);
      setMap(m);
    }
  };

  return (
    <div className="map-container">
      <div ref={ref} className="map-container__map" />
    </div>
  );
};

export default Map;
