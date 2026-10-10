import {
  AddCommentButton,
  BasicTextStyleButton,
  BlockTypeSelect,
  ColorStyleButton,
  CreateLinkButton,
  FileCaptionButton,
  FileReplaceButton,
  FormattingToolbar,
  FormattingToolbarController,
  NestBlockButton,
  TableCellMergeButton,
  TextAlignButton,
  UnnestBlockButton,
} from '@blocknote/react';
import { FontFamilyButton } from './FontFamilyButton';
import { ImageStyleButton } from './ImageStyleButton';
import { useCallback } from 'react';

export const Toolbar = () => {
  const formattingToolbar = useCallback(
    () => (
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
        <AddCommentButton />
      </FormattingToolbar>
    ),
    [],
  );

  return <FormattingToolbarController formattingToolbar={formattingToolbar} />;
};
