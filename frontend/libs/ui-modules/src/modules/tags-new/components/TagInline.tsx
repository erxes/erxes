import { IconCircleFilled, IconCirclesFilled } from '@tabler/icons-react';
import { ITag } from 'ui-modules/modules/tags-new/types/Tag';
import { TextOverflowTooltip } from 'erxes-ui';
export const TagInline = ({ tag }: { tag: ITag }) => {
  return (
    <div className="flex items-center gap-3 max-w-full">
      <span>
        {tag.isGroup ? (
          <IconCirclesFilled
            className="size-3!"
            style={{ color: tag.colorCode }}
          ></IconCirclesFilled>
        ) : (
          <IconCircleFilled
            className="size-3!"
            style={{ color: tag.colorCode }}
          ></IconCircleFilled>
        )}
      </span>
      <TextOverflowTooltip value={tag.name} />
    </div>
  );
};
