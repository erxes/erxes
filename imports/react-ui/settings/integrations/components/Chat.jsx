import Common from './Common.jsx';

class Chat extends Common {
  static getInstallCode(brandCode) {
    return `
      <script>
        window.erxesSettings = {
          brand_id: "${brandCode}"
        };
        ${Chat.installCodeIncludeScript('chat')}
      </script>
    `;
  }
}

export default Chat;
