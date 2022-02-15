import React from "react";
// import Alert from "./utils/Alert";
import ModalTrigger from "./components/ModalTrigger";
import Button from "./components/Button";

class ErrorBoundary extends React.Component<{}, { error; errorInfo }> {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
    // You can also log error messages to an error reporting service here
  }

  render() {
    // let eroor = this.state.errorInfo.componentStack;
    // let infoo = eroor.toString();
    
    if (this.state.errorInfo) {
      // Error path
      // Alert.error(this.state.errorInfo.componentStack.toString());;
      // return <div>Error occured</div>
      return(
        <ModalTrigger
        trigger={<Button>Detail</Button>}
        title="error"
        content={()=> <div style={{ whiteSpace: 'pre-wrap' }}>{this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}</div>}
        />
      )
    }
    // Normally, just render children
    return this.props.children;
  }
}

export default ErrorBoundary;
