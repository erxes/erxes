import React from "react";
import { __, Alert } from "./utils";

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
  }

  render() {
    if (this.state.errorInfo) {
      Alert.error(__(this.state.error.toString()), 10000);
      return <div></div>
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
