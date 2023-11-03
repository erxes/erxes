import React from 'react';
import { useRichTextEditorContext } from '../RichTextEditor.context';
import Select from 'react-select-plus';
import { getAttributesForEachSelected } from '../utils/getAttributesForEachSelected';
import { FontSelectWrapper } from './styles';

type SelectProps = {
  value: string;
  label: string | number;
};

const DEFAULT_FONT_SIZE_SELECT_OPTIONS: (string | number)[] = [
  'default',
  '8',
  '9',
  '10',
  '11',
  '12',
  '14',
  '16',
  '18',
  '20',
  '22',
  '24',
  '26',
  '28',
  '36',
  '42',
  '72'
];

export const RichTextEditorFontControl = () => {
  const ctx = useRichTextEditorContext();
  // Determine if all of the selected content shares the same set font size.
  // Scenarios:
  // 1) If there is exactly one font size amongst the selected content and all
  //    of the selected content has the font size set, we'll show that as the
  //    current Selected value (as a user would expect).
  // 2) If there are multiple sizes used in the selected content or some
  //    selected content has font size set and other content does not, we'll
  //    assign the Select's `value` to a sentinel variable so that users can
  //    unset the sizes or can change to any given size.
  // 3) Otherwise (no font size is set in any selected content), we'll show the
  //    unsetOption as selected.

  const allCurrentTextStyleAttrs = ctx.editor
    ? getAttributesForEachSelected(ctx.editor?.state, 'textStyle')
    : [];
  const isTextStyleAppliedToEntireSelection = !!ctx.editor?.isActive(
    'textStyle'
  );
  const currentFontSizes: string[] = allCurrentTextStyleAttrs.map(
    attrs => attrs.fontSize ?? '' // Treat any null/missing font-size as ""
  );
  if (!isTextStyleAppliedToEntireSelection) {
    // If there is some selected content that does not have textStyle, we can
    // treat it the same as a selected textStyle mark with fontSize set to null
    // or ""
    currentFontSizes.push('');
  }
  const numUniqueCurrentFontSizes = new Set(currentFontSizes).size;

  let currentFontSize: string | number;
  if (numUniqueCurrentFontSizes === 1) {
    // There's exactly one font size selected, so show that
    currentFontSize = currentFontSizes[0];
  } else if (numUniqueCurrentFontSizes > 1) {
    // There are multiple font sizes (either explicitly, or because some of the
    // selection has a font size set and some does not). This is similar to what
    // Microsoft Word and Google Docs do, for instance, showing the font size
    // input as blank when there are multiple values. If we simply set
    // currentFontSize as "" here, then the "unset option" would show as
    // selected, which would prevent the user from unsetting the font sizes
    // for the selected content (since Select onChange does not fire when the
    // currently selected option is chosen again).
    currentFontSize = '';
  } else {
    // Show as unset (empty), since there are no font sizes in any of the
    // selected content. This will show the "unset option" with the
    // unsetOptionLabel as selected, if `hideUnsetOption` is false.
    currentFontSize = '';
  }

  const setSize = (size: string) => {
    if (size === 'default') {
      ctx.editor
        ?.chain()
        .unsetFontSize()
        .focus()
        .run();
      return;
    }
    ctx.editor
      ?.chain()
      .setFontSize(size)
      .focus()
      .run();
  };

  return (
    <FontSelectWrapper>
      <Select
        optionClassName="needsclick"
        placeholder="Size"
        multi={false}
        value={currentFontSize}
        onChange={(val: SelectProps) => setSize(val.value)}
        options={DEFAULT_FONT_SIZE_SELECT_OPTIONS.map(size => ({
          value: size,
          label: size
        }))}
      />
    </FontSelectWrapper>
  );
};
