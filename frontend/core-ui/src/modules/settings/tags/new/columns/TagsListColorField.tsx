import { IconCircleFilled, IconCirclesFilled } from '@tabler/icons-react';
import { Button, ColorPicker } from 'erxes-ui';
import { useState } from 'react';
import { useTagsEdit } from 'ui-modules/modules/tags/hooks/useTagsEdit';
import { TAG_DEFAULT_COLORS } from '../constants/Colors';
export const TagsListColorField = ({
  colorCode,
  isGroup,
  id,
}: {
  colorCode: string;
  isGroup: boolean;
  id?: string;
}) => {
  const { tagsEdit } = useTagsEdit();
  const [open, setOpen] = useState(false);
  const _handleSave = (newColorCode: string) => {
    tagsEdit({
      variables: {
        id,
        colorCode: newColorCode,
      },
    });
  };
  return (
    <ColorPicker.Provider
      open={open}
      onOpenChange={setOpen}
      colors={TAG_DEFAULT_COLORS}
      value={colorCode}
      onValueChange={(col) => {
        _handleSave(col);
        setOpen(false);
      }}
    >
      <ColorPicker.Trigger asChild>
        <Button
          className="size-6 flex items-center justify-center p-0 shadow-none bg-transparent hover:bg-muted-foreground/20 shrink-0"
          variant="ghost"
          onClick={(e) => e.stopPropagation()}
        >
          {isGroup ? (
            <IconCirclesFilled
              className="size-3!"
              style={{ color: colorCode }}
            ></IconCirclesFilled>
          ) : (
            <IconCircleFilled
              className="size-3!"
              style={{ color: colorCode }}
            ></IconCircleFilled>
          )}
        </Button>
      </ColorPicker.Trigger>
      <ColorPicker.Content setOpen={setOpen} />
    </ColorPicker.Provider>
  );
};
