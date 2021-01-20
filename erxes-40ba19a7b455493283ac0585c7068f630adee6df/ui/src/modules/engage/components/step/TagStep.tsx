import Icon from 'modules/common/components/Icon';
import { IButtonMutateProps } from 'modules/common/types';
import { TagAdd, TargetCount } from 'modules/engage/types';
import { ITag } from 'modules/tags/types';
import React from 'react';
import Common from './Common';
import TagsForm from './forms/TagsForm';

type Props = {
  tagIds: string[];
  messageType: string;
  tags: ITag[];
  targetCount: TargetCount;
  customersCount: (ids: string[]) => number;
  onChange: (name: string, value: string[]) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  renderContent: ({
    actionSelector,
    selectedComponent,
    customerCounts
  }: {
    actionSelector: React.ReactNode;
    selectedComponent: React.ReactNode;
    customerCounts: React.ReactNode;
  }) => React.ReactNode;
};

const TagStep = (props: Props) => {
  const {
    onChange,
    tags,
    tagIds,
    targetCount,
    customersCount,
    messageType,
    renderContent,
    renderButton
  } = props;

  const icons: React.ReactNode[] = [];

  tags.forEach(tag => {
    icons.push(<Icon icon="tag-alt" style={{ color: tag.colorCode }} />);
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
      Form={TagsForm}
      content={renderContent}
      renderButton={renderButton}
      icons={icons}
    />
  );
};

export default TagStep;
