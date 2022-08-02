const customPlugins = (editor, options?) => {
  const { pages = [], contentTypes = [], open } = options;
  const bm = editor.BlockManager;

  pages.map(page => {
    bm.add(page.name, {
      label: page.name,
      category: {
        label: 'Pages',
        open
      },
      content: `<div>{{${page.name}}}</div>`
    });
  });

  contentTypes.map(type => {
    const fields = type.fields || [];

    for (const field of fields) {
      const code = type.code + field.code;

      bm.add(code, {
        category: { label: `Content type: ${type.displayName}`, open },
        label: field.text,
        content: `<div>{{entry.${field.code}}}</div>`
      });
    }
  });
};

export default customPlugins;
