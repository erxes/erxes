CKEDITOR.plugins.add('formInsert', {
  requires: ['richcombo'],
  init: function(editor) {
    // init the default config
    var defaultConfig = {
      format:
        '<div data-erxes-embed="%formCode%" data-erxes-brand="%brandCode%"></div>',
      items: []
    };

    // merge default config with the passed
    var config = CKEDITOR.tools.extend(
      defaultConfig,
      editor.config.formInsert || {},
      true
    );

    // Gets the list of insertable strings from the settings.
    var strings = config.items;
    // add the menu to the editor
    editor.ui.addRichCombo('formInsert', {
      name: 'formInsert',
      label: config.label || 'Insert form',
      title: config.title || 'Insert form',
      voiceLabel: config.voice || 'Insert form',
      className: 'cke_format',
      multiSelect: false,
      panel: {
        css: [editor.config.contentsCss, CKEDITOR.skin.getPath('editor')],
        voiceLabel: editor.lang.panelVoiceLabel
      },

      init: function() {
        for (var i = 0, len = strings.length; i < len; i++) {
          string = strings[i];
          // If there is no value, make a group header using the name.
          if (!string.value) {
            this.startGroup(string.name);
          }

          // If we have a value, we have a string insert row.
          else {
            // If no name provided, use the value for the name.
            if (!string.name) {
              string.name = string.value;
            }
            // If no label provided, use the name for the label.
            if (!string.label) {
              string.label = string.name;
            }

            const codes = string.value.split(',');

            if (codes.length === 2) {
              this.add(
                `<div data-erxes-embed="${codes[0]}" data-erxes-brand="${codes[1]}" style="margin-bottom: 12px"></div>`,
                string.name,
                string.label
              );
            }
          }
        }
      },

      onClick: function(value) {
        editor.focus();
        editor.fire('saveSnapshot');
        editor.insertHtml(value);
        editor.fire('saveSnapshot');
      }
    });
  }
});
