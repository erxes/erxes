import { Extension } from '@tiptap/core';

export type FontSizeAttrs = {
  fontSize?: string | null;
};

export type FontSizeOptions = {
  /**
   * What types of marks this applies to. By default just "textStyle".
   * (https://tiptap.dev/api/marks/text-style).
   */
  types: string[];
};

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Set the text font size. ex: "12px", "2em", or "small". Must be a valid
       * CSS font-size
       * (https://developer.mozilla.org/en-US/docs/Web/CSS/font-size).
       */
      setFontSize: (fontSize: string) => ReturnType;
      /**
       * Unset the text font size.
       */
      unsetFontSize: () => ReturnType;
    };
  }
}

/**
 * Allow for setting the font size of text. Requires the TextStyle extension
 * https://tiptap.dev/api/marks/text-style, as Tiptap suggests.
 */
const FontSize = Extension.create<FontSizeOptions>({
  name: 'fontSize',

  addOptions() {
    return {
      types: ['textStyle']
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: (attributes: FontSizeAttrs) => {
              if (!attributes.fontSize) {
                return {};
              }

              return {
                style: `font-size: ${attributes.fontSize}`
              };
            }
          }
        }
      }
    ];
  },

  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run();
      }
    };
  }
});

export default FontSize;
