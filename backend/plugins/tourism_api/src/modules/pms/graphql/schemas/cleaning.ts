import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
   enum ROOM_STATUS {
    clean
    cleaning
    dirty
    serving
    blocked
    repair
  }

  type Cleaning {
    _id: String!
    roomId: String
    status: ROOM_STATUS
  }

  type CleaningHistory {
    _id: String!
    roomId: String
    status: ROOM_STATUS
    statusPrev:String
    who: String
    date: Date
  }
`;

export const queries = `
  pmsCleanings: [Cleaning]
  pmsCleaningsHistory(roomIds:[String]):[CleaningHistory]
`;

export const mutations = `
  pmsCleaningUpdateBulk(roomIds:[String],status: ROOM_STATUS, who: String ): JSON
`;
