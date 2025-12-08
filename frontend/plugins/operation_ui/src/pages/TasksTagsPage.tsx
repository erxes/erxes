import { PageSubHeader } from 'erxes-ui';
import { TagsSettingFilter, TagsRecordTable } from 'ui-modules';

export const TasksTagsPage = () => {
  return (
    <div className="flex flex-auto overflow-hidden">
      <div className="flex flex-col h-full overflow-hidden flex-1">
        <PageSubHeader>
          <TagsSettingFilter />
        </PageSubHeader>
        <TagsRecordTable tagType="operation:task" />
      </div>
    </div>
  );
};
