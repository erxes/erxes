import Image from '@tiptap/extension-image';

export const enum ImageDisplay {
  INLINE = 'inline',
  BREAK_TEXT = 'block',
  FLOAT_LEFT = 'left',
  FLOAT_RIGHT = 'right'
}

export interface IImageOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, any>;
  useFigure: boolean;
}
declare module '@tiptap/core' {
  interface ICommands<ReturnType> {
    imageResize: {
      setImage: (options: {
        src: string;
        alt?: string;
        title?: string;
        width?: string | number;
        height?: string | number;
        isDraggable?: boolean;
      }) => ReturnType;
    };
  }
}
export const ImageResize = Image.extend<IImageOptions>({
  name: 'imageResize',
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: element => {
          const width =
            element.style.width || element.getAttribute('width') || null;
          return width;
        },
        renderHTML: attributes => {
          return {
            width: attributes.width
          };
        }
      },
      height: {
        default: null,
        parseHTML: element => {
          const height =
            element.style.height || element.getAttribute('height') || null;
          return height;
        },
        renderHTML: attributes => {
          return {
            height: attributes.height
          };
        }
      }
    };
  },
  parseHTML() {
    return [
      {
        tag: 'img[src]'
      }
    ];
  }
});
