/**
 * What the side panel asks a plugin's `./recordPanel` remote to draw for one
 * of its records: the header title and actions, or the Detail, Properties or
 * Activity tab.
 */
export type TRecordPanelView =
  | 'title'
  | 'actions'
  | 'detail'
  | 'properties'
  | 'activity'
  // A record not created yet (`contentId` is `NEW_RECORD_ID`): its draft,
  // which creates the record and replaces itself with it.
  | 'new';

export interface IRecordPanelProps {
  contentType: string;
  contentId: string;
  view: TRecordPanelView;
}
