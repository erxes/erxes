import Common from './Common.jsx';

class InAppMessaging extends Common {
  static getInstallCode(brandCode) {
    return `
      <script>
        window.erxesSettings = {
          brand_id: "${brandCode}"
        };
        ${InAppMessaging.installCodeIncludeScript('inApp')}
      </script>
    `;
  }
}

export default InAppMessaging;
