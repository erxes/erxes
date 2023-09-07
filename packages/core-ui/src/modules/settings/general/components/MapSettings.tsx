import React from 'react';
import CollapseContent from 'modules/common/components/CollapseContent';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Select from 'react-select-plus';
import { __ } from 'modules/common/utils';
import { FormControl } from 'modules/common/components/form';
import { KEY_LABELS } from '@erxes/ui-settings/src/general/constants';
import Info from 'modules/common/components/Info';

type MapConfigs = {
  mapProvider: string;
  geoCodingApi: string;
  routingApi: string;
  googleMapApiKey: string;
};

type Props = {
  configsMap: MapConfigs;
  onChangeConfig: (code: string, value: any) => void;
};

const MAP_PROVIDER_OPTIONS = [
  { value: 'openstreetmap', label: 'Open Street Map' },
  { value: 'google', label: 'Google Map' }
  // TODO: add mapbox
];

const MAP_GEOCODER_OPTIONS = [
  { value: 'nominatim', label: 'Nominatim' },
  { value: 'google', label: 'Google Map' }
];

const MAP_ROUTES_API_OPTIONS = [
  { value: 'osrm', label: 'Open Source Routing Machine' },
  { value: 'google', label: 'Google Map' }
];

const MapSettings = (props: Props) => {
  const {
    configsMap = {
      mapProvider: 'openstreetmap',
      geoCodingApi: 'nominatim',
      routingApi: 'osrm',
      googleMapApiKey: ''
    }
  } = props;

  const onChangeConfig = (code: string, value: any) => {
    props.onChangeConfig('MAP_CONFIGS', { ...configsMap, [code]: value });
  };

  return (
    <CollapseContent title={__('Maps/Address')}>
      <FormGroup>
        <ControlLabel>{'Map provider'}</ControlLabel>
        <p>{__('Choose map provider')}</p>
        <Select
          options={MAP_PROVIDER_OPTIONS}
          value={configsMap.mapProvider}
          clearable={false}
          searchable={false}
          multi={false}
          onChange={e => {
            onChangeConfig('mapProvider', e.value);
          }}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel>{'Geo Coding API provider'}</ControlLabel>
        {configsMap.geoCodingApi === 'google' && (
          <Info type="warning">
            <a
              target="_blank"
              href={
                'https://developers.google.com/maps/documentation/geocoding/usage-and-billing'
              }
              rel="noopener noreferrer"
            >
              {__(
                'If you use Google Map API, you need to enable billing for your project. And additonal charges may apply.'
              )}
            </a>
          </Info>
        )}
        <Select
          options={MAP_GEOCODER_OPTIONS}
          value={configsMap.geoCodingApi}
          clearable={false}
          searchable={false}
          multi={false}
          onChange={e => {
            onChangeConfig('geoCodingApi', e.value);
          }}
        />
      </FormGroup>

      <FormGroup>
        <ControlLabel>{'Routing API provider'}</ControlLabel>
        {configsMap.routingApi === 'google' && (
          <Info type="warning">
            <a
              target="_blank"
              href={
                'https://developers.google.com/maps/billing-and-pricing/pricing'
              }
              rel="noopener noreferrer"
            >
              {__(
                'If you use Google Map API, you need to enable billing for your project. And additonal charges may apply.'
              )}
            </a>
          </Info>
        )}
        <Select
          options={MAP_ROUTES_API_OPTIONS}
          value={configsMap.routingApi}
          clearable={false}
          searchable={false}
          multi={false}
          onChange={e => {
            onChangeConfig('routingApi', e.value);
          }}
        />
      </FormGroup>

      {(configsMap.mapProvider === 'google' ||
        configsMap.geoCodingApi === 'google' ||
        configsMap.routingApi === 'google') && (
        <FormGroup>
          <ControlLabel>{KEY_LABELS.GOOGLE_MAP_API_KEY}</ControlLabel>
          <p>{__('Google Map Api Key')}</p>
          <FormControl
            defaultValue={configsMap.googleMapApiKey}
            onChange={(e: any) => {
              onChangeConfig('googleMapApiKey', e.target.value);
            }}
          />
        </FormGroup>
      )}
    </CollapseContent>
  );
};

export default MapSettings;
