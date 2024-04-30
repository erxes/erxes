import CollapseContent from "@erxes/ui/src/components/CollapseContent";
import Icon from "@erxes/ui/src/components/Icon";
import React from "react";

class Settings extends React.Component<any> {
  render() {
    const { renderItem } = this.props;

    return (
      <CollapseContent
        title="Golomtbank"
        beforeTitle={<Icon icon="wrench" />}
        transparent={true}
      >
        {renderItem("GOLOMTBANK_ACCESS_KEY", "", "", "", "Key")}
        {renderItem("GOLOMTBANK_ACCESS_TOKEN", "", "", "", "Token")}
      </CollapseContent>
    );
  }
}

export default Settings;
