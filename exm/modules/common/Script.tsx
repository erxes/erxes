import React from "react";
import { getEnv } from "../../utils/configs";

const { REACT_APP_DOMAIN } = getEnv();

class Script extends React.Component<{
  messengerBrandCode?: string;
  erxesForms?: any[];
}> {
  componentDidMount() {
    const { messengerBrandCode, erxesForms = [] } = this.props;

    const settings = {
      messenger: {
        brand_id: messengerBrandCode ? messengerBrandCode : "",
      },
      forms: [],
    };

    for (const form of erxesForms) {
      settings.forms.push({ brand_id: form.brandId, form_id: form.formId });
    }

    (window as any).erxesSettings = settings;

    if (erxesForms && erxesForms.length !== 0) {
      return (() => {
        const script = document.createElement("script");
        script.src = `${
          REACT_APP_DOMAIN.includes("https")
            ? `${REACT_APP_DOMAIN}/widgets`
            : "http://localhost:3200"
        }/build/formWidget.bundle.js`;
        script.async = true;

        const entry = document.getElementsByTagName("script")[0];
        entry.parentNode.insertBefore(script, entry);
      })();
    }

    if (messengerBrandCode) {
      return (() => {
        const script = document.createElement("script");
        script.src = `${
          REACT_APP_DOMAIN.includes("https")
            ? `${REACT_APP_DOMAIN}/widgets`
            : "http://localhost:3200"
        }/build/messengerWidget.bundle.js`;
        script.async = true;

        const entry = document.getElementsByTagName("script")[0];
        entry.parentNode.insertBefore(script, entry);
      })();
    }
  }

  render() {
    return null;
  }
}

export default Script;
