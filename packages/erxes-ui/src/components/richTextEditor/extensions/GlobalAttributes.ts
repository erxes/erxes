import { Extension } from '@tiptap/core';
export const GlobalAttributes = Extension.create({
  addGlobalAttributes() {
    return [
      {
        // Extend the following extensions
        types: ['table'],
        // … with those attributes
        attributes: {
          border: {
            parseHTML: (element) => element.getAttribute('border'),
          },

          cellSpacing: {
            parseHTML: (element) => element.getAttribute('cellspacing'),
          },
          cellPadding: {
            parseHTML: (element) => element.getAttribute('cellpadding'),
          },
          width: {
            default: null,
            parseHTML: (element) => {
              const width =
                element.style.width || element.getAttribute('width') || null;
              return width;
            },
            renderHTML: (attributes) => {
              return {
                width: attributes.width,
              };
            },
          },
        },
      },
    ];
  },
});
