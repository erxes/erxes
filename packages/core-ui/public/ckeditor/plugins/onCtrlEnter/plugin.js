CKEDITOR.plugins.add('onCtrlEnter', {
  init: function (editor) {
    var config = editor.config;
    var onCtrlEnter = config.onCtrlEnter;
    var shortcutKeys = CKEDITOR.CTRL + 13;

    editor.addCommand('insertSoftHyphen', {
      exec: function () {
        if (onCtrlEnter) {
          return onCtrlEnter();
        } else {
          return;
        }
      }
    });

    editor.keystrokeHandler.keystrokes[shortcutKeys] = 'insertSoftHyphen';
  }
});