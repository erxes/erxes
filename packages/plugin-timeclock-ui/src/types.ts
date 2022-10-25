export interface ITimeclock {
  _id: string;
  date: string;
  shiftStart: Date;
  shiftEnd: Date;
  shiftDone: boolean;
}

// queries
export type TimeClockQueryResponse = {
  timeclocks: ITimeclock[];
  refetch: () => void;
  loading: boolean;
};

// mutations
export type MutationVariables = {
  _id?: string;
  time: Date;
  userId: string;
};

export type TimeClockMutationResponse = {
  startTimeMutation: (params: { variables: MutationVariables }) => Promise<any>;
  stopTimeMutation: (params: { variables: MutationVariables }) => Promise<any>;
};

// export type EditMutationResponse = {
//   editMutation: (params: { variables: MutationVariables }) => Promise<any>;
// };

// export type RemoveMutationResponse = {
//   removeMutation: (params: { variables: { _id: string } }) => Promise<any>;
// };

// export type EditTypeMutationResponse = {
//   typesEdit: (params: { variables: MutationVariables }) => Promise<any>;
// };

// export type RemoveTypeMutationResponse = {
//   typesRemove: (params: { variables: { _id: string } }) => Promise<any>;
// };

// export type TimeclockMutationVariables = {
//   type: string;
//   targetIds: string[];
//   tagIds: string[];
// }
