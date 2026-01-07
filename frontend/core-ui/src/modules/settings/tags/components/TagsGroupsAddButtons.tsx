import { Button } from 'erxes-ui';
import { useTagContext } from '@/settings/tags/providers/TagProvider';
import { useTranslation } from 'react-i18next';
import { addingTagAtom } from 'ui-modules/modules/tags-new/states/addingTagAtom';
import { useAtom } from 'jotai';
export const TagsGroupsAddButtons = () => {
  const [addingTag, setAddingTag] = useAtom(addingTagAtom);
  const { t } = useTranslation('settings', {
    keyPrefix: 'tags',
  });
  return (
    <div className="flex gap-2">
      <Button
        onClick={() => {
          setAddingTag({
            isGroup: true,
          });
        }}
        disabled={addingTag?.isGroup}
        variant="outline"
      >
        {t('add-group')}
      </Button>
      <Button
        onClick={() => {
          setAddingTag({
            isGroup: false,
          });
        }}
        disabled={addingTag !== null && !addingTag.isGroup}
      >
        {t('add-tag')}
      </Button>
    </div>
  );
};
