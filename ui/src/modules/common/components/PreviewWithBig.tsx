import React from "react";
import { __ } from "modules/common/utils";

class PreviewWithBig extends React.Component<any, any> {
  
  render() {
    const { children, show } = this.props;
    const showHideClassName = show ? "block" : "none";

    return (
      <>
        <div style={{ display: showHideClassName }}>{children}</div>
      </>
    );
  }
}

export default PreviewWithBig;
