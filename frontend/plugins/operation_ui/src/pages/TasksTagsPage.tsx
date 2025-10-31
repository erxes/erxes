import { PageSubHeader } from 'erxes-ui';
import { TagsSettingFilter } from '~/modules/tags/components/TagsSettingFilter';
import { TagsRecordTable } from '~/modules/tags/components/TagsRecordTable';

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
