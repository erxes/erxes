import { gql } from '@apollo/client';
import React from 'react';
import { useQuery } from '@apollo/client';
import { ErrorMsg } from '../../components';
import Map, { IMapProps } from '../../components/map/Map';
import Spinner from '../../components/Spinner';

export default function MapContainer(props: IMapProps) {
  const configsGetValue = gql`
    query configsGetValue($code: String!) {
      configsGetValue(code: $code)
    }
  `;

  let googleMapApiKey = props.googleMapApiKey || '';

  const { data, loading, error } = useQuery(configsGetValue, {
    variables: { code: 'GOOGLE_MAP_API_KEY' },
    skip: googleMapApiKey.length !== 0,
    fetchPolicy: 'network-only'
  });

  if (loading) {
    return <Spinner objective={true} />;
  }

  if (error) {
    return (
      <div>
        <ErrorMsg>{error.message}</ErrorMsg>
      </div>
    );
  }

  googleMapApiKey = data.configsGetValue ? data.configsGetValue.value : '';

  return <Map {...props} googleMapApiKey={googleMapApiKey} />;
}
