import { EmptyState, Spinner } from 'modules/common/components';
import React from 'react';

type Props = {
  data: any;
  count?: any;
  loading: boolean;
  emptyText?: string;
  emptyIcon?: string;
  emptyImage?: string;
  size?: string;
  objective?: boolean;
};

class DataWithLoader extends React.Component<Props> {
  static defaultProps = {
    emptyText: 'There is no data',
    emptyIcon: '',
    emptyImage: '',
    size: 'full',
    objective: false
  };

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
          text={emptyText || 'There is no data'}
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
