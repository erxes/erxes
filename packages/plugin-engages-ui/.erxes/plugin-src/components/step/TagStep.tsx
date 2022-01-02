import Icon from 'erxes-ui/lib/components/Icon';
import { IButtonMutateProps } from 'erxes-ui/lib/types';
import { TagAdd, TargetCount } from '../../types';
import React from 'react';
import Common from './Common';
import TagsForm from './forms/TagsForm';

type Props = {
  tagIds: string[];
  messageType: string;
  tags: any[];
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
    <Common<any, TagAdd>
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
      formProps={{ tags }}
    />
  );
};

export default TagStep;
