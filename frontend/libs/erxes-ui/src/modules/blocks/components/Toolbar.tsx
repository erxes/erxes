import { CreateLinkButton } from '@blocknote/react';

import {
  BasicTextStyleButton,
  BlockTypeSelect,
  ColorStyleButton,
  FileCaptionButton,
  FileReplaceButton,
  FormattingToolbar,
  FormattingToolbarController,
  NestBlockButton,
  TextAlignButton,
  UnnestBlockButton,
  TableCellMergeButton,
} from '@blocknote/react';

export const Toolbar = () => {
  return (
    <FormattingToolbarController
      formattingToolbar={() => (
        <FormattingToolbar>
          <BlockTypeSelect key={'blockTypeSelect'} />
          <FileCaptionButton key={'fileCaptionButton'} />
          <FileReplaceButton key={'replaceFileButton'} />
          <BasicTextStyleButton
            basicTextStyle={'bold'}
            key={'boldStyleButton'}
          />
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
          {/* Extra button to toggle code styles */}
          <BasicTextStyleButton
            key={'codeStyleButton'}
            basicTextStyle={'code'}
          />
          <TextAlignButton textAlignment={'left'} key={'textAlignLeftButton'} />
          <TextAlignButton
            textAlignment={'center'}
            key={'textAlignCenterButton'}
          />
          <TextAlignButton
            textAlignment={'right'}
            key={'textAlignRightButton'}
          />
          <ColorStyleButton key={'colorStyleButton'} />
          <NestBlockButton key={'nestBlockButton'} />
          <UnnestBlockButton key={'unnestBlockButton'} />
          <CreateLinkButton key={'createLinkButton'} />
          <TableCellMergeButton key={'mergeTableCellButton'} />
        </FormattingToolbar>
      )}
    />
  );
};
