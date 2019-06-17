import { Icon } from 'modules/common/components';
import { TagAdd, TargetCount } from 'modules/engage/types';
import { ITag } from 'modules/tags/types';
import * as React from 'react';
import Common from './Common';
import { TagsForm } from './forms';

type Props = {
  tagIds: string[];
  messageType: string;
  tags: ITag[];
  targetCount: TargetCount;
  customersCount: (ids: string[]) => number;
  onChange: (name: string, value: string[]) => void;
  tagAdd: TagAdd;
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

  const icons: React.ReactNode[] = [];

  tags.forEach(tag => {
    icons.push(<Icon icon="piechart icon" style={{ color: tag.colorCode }} />);
  });

  return (
    <Common<ITag, TagAdd>
      name="tagIds"
      label="Create a tag"
      targetIds={tagIds}
      messageType={messageType}
      targets={tags}
      targetCount={targetCount}
      customersCount={customersCount}
      onChange={onChange}
      onSubmit={tagAdd}
      Form={TagsForm}
      content={renderContent}
      icons={icons}
    />
  );
};

export default TagStep;
