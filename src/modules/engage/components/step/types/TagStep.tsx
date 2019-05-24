import { TargetCount } from 'modules/engage/types';
import { ITag } from 'modules/tags/types';
import * as React from 'react';
import { TagsForm } from '../forms';
import Common from './Common';

type Props = {
  tagIds: string[];
  messageType: string;
  tags: ITag[];
  targetCount: TargetCount;
  customersCount: (ids: string[]) => number;
  onChange: (
    name: 'brandIds' | 'tagIds' | 'segmentIds',
    value: string[]
  ) => void;
  tagAdd: (params: { doc: { name: string; description: string } }) => void;
  renderContent: (
    {
      actionSelector,
      selectedComponent,
      customerCounts
    }: {
      actionSelector: React.ReactNode;
      selectedComponent: React.ReactNode;
      customerCounts: React.ReactNode;
    }
  ) => React.ReactNode;
};

const TagStep = (props: Props) => {
  const {
    tagAdd,
    onChange,
    tags,
    tagIds,
    targetCount,
    customersCount,
    messageType,
    renderContent
  } = props;

  return (
    <Common
      name="tagIds"
      label="Create a tag"
      targetIds={tagIds}
      messageType={messageType}
      targets={tags}
      targetCount={targetCount}
      customersCount={customersCount}
      onChange={onChange}
      save={tagAdd}
      Form={TagsForm}
      content={renderContent}
    />
  );
};

export default TagStep;
