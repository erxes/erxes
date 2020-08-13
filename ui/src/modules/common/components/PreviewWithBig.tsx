import React from "react";

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
