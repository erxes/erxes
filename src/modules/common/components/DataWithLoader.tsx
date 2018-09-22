import { EmptyState, Spinner } from "modules/common/components";
import React, { Component } from "react";

type Props = {
  data: any;
  count: any;
  loading: boolean;
  emptyText?: string;
  emptyIcon?: string;
  emptyImage?: string;
  size?: string;
  objective?: boolean;
} & Partial<DefaultProps>;

type DefaultProps = Readonly<typeof defaultProps>;

const defaultProps = {
  emptyText: "There is no data",
  emptyIcon: "",
  emptyImage: "",
  size: "full",
  objective: false
};

class DataWithLoader extends Component<Props> {
  static defaultProps = defaultProps;

  showData() {
    const {
      loading,
      count,
      data,
      emptyIcon,
      emptyImage,
      emptyText,
      size,
      objective
    } = this.props;

    if (loading) {
      return <Spinner objective={objective} />;
    } else if (count === 0) {
      return (
        <EmptyState
          text={emptyText || "There is no data"}
          size={size}
          icon={emptyIcon}
          image={emptyImage}
        />
      );
    }
    return data;
  }

  render() {
    return this.showData();
  }
}

export default DataWithLoader;
