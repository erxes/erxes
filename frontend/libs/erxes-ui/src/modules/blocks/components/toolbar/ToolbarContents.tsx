import {
  BasicTextStyleButton,
  ComponentsContext,
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
import { FontFamilyButton } from 'erxes-ui/modules/blocks/components/FontFamilyButton';
import { ImageStyleButton } from 'erxes-ui/modules/blocks/components/ImageStyleButton';

import { useToolbarComponents } from 'erxes-ui/modules/blocks/hooks/toolbar/useToolbarComponents';

export const ToolbarContents = () => {
  const toolbarComponents = useToolbarComponents();

  if (!toolbarComponents) {
    return null;
  }

  return (
    <ComponentsContext.Provider value={toolbarComponents}>
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
