import Button from '@erxes/ui/src/components/Button';
import { Header } from '../../styles';
import { Link } from 'react-router-dom';
import React from 'react';

class SidebarHeader extends React.PureComponent {
  render() {
    return (
      <Header>
        <Link to="/settings/">
          <Button
            btnStyle="simple"
            icon="arrow-circle-left"
            block={true}
            uppercase={false}
          >
            Back to Settings
          </Button>
        </Link>
      </Header>
    );
  }
}

export default SidebarHeader;
