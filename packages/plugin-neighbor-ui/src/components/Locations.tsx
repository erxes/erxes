import React from 'react';

import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import FormControl from '@erxes/ui/src/components/form/Control';
import { FlexRow, SidebarContent } from '../styles';
import { ExpandWrapper } from '@erxes/ui-settings/src/styles';
import { School } from '../types';
import Map from '@erxes/ui/src/components/map/Map';

const Locations = ({ data, name, onChange }) => {
  const onChangeLocationInput = (e, key) => {
    const customData = data || ({} as School);

    const coordinates =
      customData.locationValue && customData.locationValue.coordinates
        ? customData.locationValue.coordinates
        : [,];
    coordinates[key] = Number((e.target as HTMLInputElement).value);

    onChange(name, {
      ...data,
      locationValue: {
        type: 'Point',
        coordinates
      }
    });
  };

  const latitude =
    data &&
    data.locationValue &&
    data.locationValue.coordinates &&
    data.locationValue.coordinates.length > 0 &&
    data.locationValue.coordinates[0];
  const longitude =
    data &&
    data.locationValue &&
    data.locationValue.coordinates &&
    data.locationValue.coordinates.length > 1 &&
    data.locationValue.coordinates[1];

  let option = [
    {
      lat: latitude,
      lng: longitude,
      description: ''
    }
  ];
  return (
    <>
      <FlexRow>
        <ExpandWrapper>
          <FormGroup>
            <ControlLabel>Latitude</ControlLabel>
            <FormControl
              value={latitude}
              type="Number"
              onChange={e => onChangeLocationInput(e, 0)}
              required={false}
            ></FormControl>
          </FormGroup>
        </ExpandWrapper>
        <ExpandWrapper>
          <FormGroup>
            <ControlLabel>Longitude</ControlLabel>
            <FormControl
              value={longitude}
              type="Number"
              onChange={e => onChangeLocationInput(e, 1)}
              required={false}
            ></FormControl>
          </FormGroup>
        </ExpandWrapper>
      </FlexRow>
      <FlexRow>
        <SidebarContent>
          <Map
            id={Math.random().toString(10)}
            center={{
              lat: latitude || 47.9,
              lng: longitude || 106.9
            }}
            googleMapApiKey={localStorage.getItem('GOOGLE_MAP_API_KEY') || ''}
            locationOptions={option}
            streetViewControl={false}
            onChangeMarker={onChange}
          />
        </SidebarContent>
      </FlexRow>
    </>
  );
};

export default Locations;
