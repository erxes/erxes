import {
  BasicTextStyleButton,
  ComponentsContext,
  useComponentsContext,
  BlockTypeSelect,
  ColorStyleButton,
  CreateLinkButton,
  FileCaptionButton,
  FileReplaceButton,
  FormattingToolbar,
  NestBlockButton,
  TableCellMergeButton,
  TextAlignButton,
  UnnestBlockButton,
} from '@blocknote/react';
import { FontFamilyButton } from './FontFamilyButton';
import { ImageStyleButton } from './ImageStyleButton';

import { ToolbarSelect } from './ToolbarSelect';
import { ToolbarMenuItem } from './ToolbarMenuItem';
import { ToolbarMenuDropdown } from './ToolbarMenuDropdown';
import { ToolbarFormattingButton } from './ToolbarFormattingButton';

export const ToolbarContents = () => {
  const Components = useComponentsContext();

  if (!Components) {
    return null;
  }

  return (
    <ComponentsContext.Provider
      value={{
        ...Components,
        FormattingToolbar: {
          ...Components.FormattingToolbar,
          Button: ToolbarFormattingButton,
          Select: ToolbarSelect,
        },
        Generic: {
          ...Components.Generic,
          Menu: {
            ...Components.Generic.Menu,
            Item: ToolbarMenuItem,
            Dropdown: ToolbarMenuDropdown,
          },
        },
      }}
    >
      <FormattingToolbar>
        <BlockTypeSelect key={'blockTypeSelect'} />
        <FontFamilyButton key={'fontFamilyButton'} />
        <ImageStyleButton />
        <FileCaptionButton key={'fileCaptionButton'} />
        <FileReplaceButton key={'replaceFileButton'} />
        <BasicTextStyleButton basicTextStyle={'bold'} key={'boldStyleButton'} />
        <BasicTextStyleButton
          basicTextStyle={'italic'}
          key={'italicStyleButton'}
        />
        <BasicTextStyleButton
          basicTextStyle={'underline'}
          key={'underlineStyleButton'}
        />
        <BasicTextStyleButton
          basicTextStyle={'strike'}
          key={'strikeStyleButton'}
        />
        <BasicTextStyleButton key={'codeStyleButton'} basicTextStyle={'code'} />
        <TextAlignButton textAlignment={'left'} key={'textAlignLeftButton'} />
        <TextAlignButton
          textAlignment={'center'}
          key={'textAlignCenterButton'}
        />
        <TextAlignButton textAlignment={'right'} key={'textAlignRightButton'} />
        <ColorStyleButton key={'colorStyleButton'} />
        <NestBlockButton key={'nestBlockButton'} />
        <UnnestBlockButton key={'unnestBlockButton'} />
        <CreateLinkButton key={'createLinkButton'} />
        <TableCellMergeButton key={'mergeTableCellButton'} />
      </FormattingToolbar>
    </ComponentsContext.Provider>
  );
};
