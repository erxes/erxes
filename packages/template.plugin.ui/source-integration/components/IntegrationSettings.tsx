import CollapseContent from "@erxes/ui/src/components/CollapseContent";
import Icon from "@erxes/ui/src/components/Icon";
import React from "react";

class Settings extends React.Component<any> {
  render() {
    const { renderItem } = this.props;

    return (
      <CollapseContent
        title="{Name}"
        beforeTitle={<Icon icon="puzzle-piece" />}
        transparent={true}
      >
        {renderItem("{NAME}_ACCESS_KEY", "", "", "", "Key")}
        {renderItem("{NAME}_ACCESS_TOKEN", "", "", "", "Token")}
      </CollapseContent>
    );
  }
}

export default Settings;
