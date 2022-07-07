import gql from 'graphql-tag';
import React from 'react';
import { useQuery } from 'react-apollo';
import Map, { IMapProps } from '../../components/map/Map';
import Spinner from '../../components/Spinner';

export default function MapContainer(props: IMapProps) {
  const configsGetValue = gql`
    query configsGetValue($code: String!) {
      configsGetValue(code: $code)
    }
  `;

  let googleMapApiKey = props.googleMapApiKey || '';

  const { data, loading } = useQuery(configsGetValue, {
    variables: { code: 'GOOGLE_MAP_API_KEY' },
    skip: googleMapApiKey.length !== 0,
    fetchPolicy: 'network-only'
  });

  if (loading) {
    return <Spinner objective={true} />;
  }

  googleMapApiKey = data.configsGetValue.value || '';

  return <Map {...props} googleMapApiKey={googleMapApiKey} />;
}
