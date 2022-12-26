import { ISegment } from '@erxes/ui-segments/src/types';
import { ICommonTypes } from '../../types';

export interface IAssignmentCampaign extends ICommonTypes {
  segmentIds?: string[];
  voucherCampaignId?: string;
}

// query types
export type AssignmentCampaignQueryResponse = {
  assignmentCampaigns: IAssignmentCampaign[];
  loading: boolean;
  refetch: () => void;
};

export type SegmentsQueryResponse = {
  segments: ISegment[];
  loading: boolean;
  refetch: () => void;
};

export type AssignmentCampaignDetailQueryResponse = {
  assignmentCampaignDetail: IAssignmentCampaign;
  loading: boolean;
  refetch: () => void;
};

export type AssignmentCampaignsCountQueryResponse = {
  assignmentCampaignsCount: number;
  loading: boolean;
  refetch: () => void;
};

export type AssignmentCampaignRemoveMutationResponse = {
  assignmentCampaignsRemove: (mutation: {
    variables: { _ids: string[] };
  }) => Promise<any>;
};
