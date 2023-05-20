import { ITag } from '@erxes/ui-tags/src/types';

export interface IEmailTemplate {
  _id: string;
  name: string;
  content: string;
  tagIds: string[];
  tags: ITag[];
}
export type EmailTemplatesTotalCountQueryResponse = {
  emailTemplatesTotalCount: number;
};

export type EmailTemplatesQueryResponse = {
  fetchMore: (params: {
    variables: { page: number };
    updateQuery: (prev: any, fetchMoreResult: any) => void;
  }) => void;
  emailTemplates: IEmailTemplate[];
  variables: { [key: string]: string | number };
  loading: boolean;
  refetch: () => void;
};
