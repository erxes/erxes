import { IconCircleFilled, IconCirclesFilled } from '@tabler/icons-react';
import { Button, ColorPicker } from 'erxes-ui';
import { useState } from 'react';

import { TAG_DEFAULT_COLORS } from '@/settings/tags/constants/Colors';
import { ITag, useTagEdit } from 'ui-modules';
export const TagsListColorField = ({ tag }: { tag: ITag }) => {
  const { editTag } = useTagEdit();
  const [open, setOpen] = useState(false);
  const _handleSave = (newColorCode: string) => {
    editTag({
      variables: {
        id: tag._id,
        colorCode: newColorCode,
      },
      optimisticResponse: {
        tagsEdit: { ...tag, colorCode: newColorCode },
      },
    });
  };
  return (
    <ColorPicker.Provider
      open={open}
      onOpenChange={setOpen}
      colors={TAG_DEFAULT_COLORS}
      value={tag.colorCode}
      onValueChange={(col) => {
        _handleSave(col);
        setOpen(false);
      }}
    >
      <ColorPicker.Trigger asChild>
        <Button
          className="size-7 flex items-center justify-center p-0 shadow-none bg-transparent hover:bg-accent-foreground/10 shrink-0"
          variant="ghost"
          onClick={(e) => e.stopPropagation()}
        >
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
        </Button>
      </ColorPicker.Trigger>
      <ColorPicker.Content setOpen={setOpen} />
    </ColorPicker.Provider>
  );
};
