import Common from './Common';

class Messenger extends Common {
  static getInstallCode(brandCode) {
    return `
      <script>
        window.erxesSettings = {
          messenger: {
            brand_id: "${brandCode}"
          },
        };
        ${Messenger.installCodeIncludeScript('messenger')}
      </script>
    `;
  }
}

export default Messenger;
