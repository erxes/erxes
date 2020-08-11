export type IFeature = {
  name: string;
  text: string;
  icon: string;
  color: string;
  videoUrl: string;
  videoThumb: string;
  description: string;
  settings: string[];
  settingsDetails: { [key: string]: { name: string; url: string } };
  isComplete: boolean;
  showSettings: boolean;
};

export type IEntry = {
  action: string;
  data: object;
};

export type IFeatureEntry = {
  name: string;
  key: string;
};

export type StepsCompletenessQueryResponse = {
  onboardingStepsCompleteness: { [key: string]: boolean };
  subscribeToMore: any;
  loading: boolean;
  refetch: () => void;
};

export type GetAvailableFeaturesQueryResponse = {
  onboardingGetAvailableFeatures: IFeature[];
  subscribeToMore: any;
  loading: boolean;
  refetch: () => void;
};

export type EntriesQueryResponse = {
  robotEntries: IEntry[];
};

export type CompleteShowStepMutationResponse = {
  completeShowStepMutation: (
    params: { variables: { step: string } }
  ) => Promise<any>;
};

export type ForceCompleteMutationResponse = {
  forceCompleteMutation: () => Promise<any>;
};

export interface IOnboardingHistory {
  _id: string;
  userId: string;
  isCompleted?: boolean;
  completedSteps: string[];
}
