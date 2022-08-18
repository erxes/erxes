import { Button, Spinner } from '@erxes/ui/src';
import React from 'react';
import { RiskAssesmentsType } from '../../common/types';
import { BoxItem } from '../../styles';

type Props = {
  categories: RiskAssesmentsType[];
  loading: boolean;
};

class Answers extends React.Component<Props> {
  renderContent() {
    const { categories } = this.props;

    return categories.map((p) => (
      <BoxItem key={p._id}>
        {p.name}
        <Button>Add Answer</Button>
      </BoxItem>
    ));
  }

  render() {
    const { loading } = this.props;

    if (loading) {
      <Spinner objective />;
    }

    return <div style={{ display: 'flex' }}>{this.renderContent()}</div>;
  }
}
export default Answers;
