import { ComponentType } from 'react';

export type TApprovalTargetProps = {
  contentId: string;
  label?: string;
};

export type TApprovalTargetComponent = ComponentType<TApprovalTargetProps>;
