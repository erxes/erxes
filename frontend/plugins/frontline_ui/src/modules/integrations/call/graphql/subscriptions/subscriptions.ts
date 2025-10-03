import { gql } from '@apollo/client';

export const QUEUE_REALTIME_UPDATE = gql`
  subscription queueRealtimeUpdate($extension: String) {
    queueRealtimeUpdate(extension: $extension)
  }
`;
