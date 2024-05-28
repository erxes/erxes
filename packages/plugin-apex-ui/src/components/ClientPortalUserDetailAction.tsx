import Button from '@erxes/ui/src/components/Button';
import React from 'react';

type Props = {
  clientPortalUser: any;
};

class Form extends React.Component<Props> {
  render() {
    const { clientPortalUser } = this.props;

    return (
      <div style={{ marginRight: '10px' }}>
        <Button
          btnStyle="success"
          type="button"
          size="small"
          href={`/trading/account/details/${clientPortalUser._id}`}
          target="__blank"
        >
          Ажилжааны түүх
        </Button>
      </div>
    );
  }
}

export default Form;
