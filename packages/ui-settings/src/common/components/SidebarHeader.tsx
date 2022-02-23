import Button from '@erxes/ui/src/components/Button';
import React from 'react';
import { Link } from 'react-router-dom';
import { TopHeader } from '@erxes/ui/src/styles/main';

class SidebarHeader extends React.PureComponent {
  render() {
    return (
      <TopHeader>
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
      </TopHeader>
    );
  }
}

export default SidebarHeader;
