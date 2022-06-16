import Button from '@erxes/ui/src/components/Button';
import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from "@erxes/ui-settings/src/styles";

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
