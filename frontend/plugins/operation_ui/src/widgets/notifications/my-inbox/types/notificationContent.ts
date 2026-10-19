import type { TNotification } from 'ui-modules';
import type { ReactNode, RefObject } from 'react';

export type NotificationTaskDetailProps = {
  contentTypeId: string;
};

export type NotificationTeamContentProps = Pick<
  TNotification,
  'action' | 'contentTypeId' | 'createdAt' | 'fromUser' | 'message'
>;

export type NotificationOpenButtonProps = {
  to: string;
  children: ReactNode;
};

export type NotificationProjectDetailProps = {
  contentTypeId: string;
};

export type TeamActorProps = { user: TNotification['fromUser'] };

export type TeamEventMetadataProps = Pick<
  TNotification,
  'action' | 'createdAt' | 'fromUser'
>;

export interface ScrollViewportHeight {
  ref: RefObject<HTMLDivElement>;
  height: number | undefined;
}
