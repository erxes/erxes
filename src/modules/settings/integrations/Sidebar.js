import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { Wrapper } from 'modules/layout/components';
import { SidebarList } from 'modules/layout/styles';
import { router } from 'modules/common/utils';

class IntegrationsSidebar extends React.Component {
  getClassName(kind) {
    const { currentIntegrationKind } = this.props;

    if (kind === currentIntegrationKind) {
      return 'active';
    }
    return null;
  }

  render() {
    const { Section, Header } = Wrapper.Sidebar;

    return (
      <Wrapper.Sidebar>
        <Section>
          <Header bold uppercase>
            Integrations
          </Header>
          <SidebarList>
            <li>
              <Link className={this.getClassName()} to="/settings/integrations">
                All
              </Link>
            </li>
            <li>
              <Link
                className={this.getClassName('messenger')}
                to="/settings/integrations?kind=messenger"
              >
                Messenger
              </Link>
            </li>
            <li>
              <Link
                className={this.getClassName('form')}
                to="/settings/integrations?kind=form"
              >
                Form
              </Link>
            </li>
            <li>
              <Link
                className={this.getClassName('twitter')}
                to="/settings/integrations?kind=twitter"
              >
                Twitter
              </Link>
            </li>
            <li>
              <Link
                className={this.getClassName('facebook')}
                to="/settings/integrations?kind=facebook"
              >
                Facebook
              </Link>
            </li>
          </SidebarList>
        </Section>
      </Wrapper.Sidebar>
    );
  }
}

IntegrationsSidebar.propTypes = {
  currentIntegrationKind: PropTypes.string,
  history: PropTypes.object
};

const SidebarContainer = props => {
  const { history } = props;
  const currentIntegrationKind = router.getParam(history, 'kind');

  const extendedProps = { ...props, currentIntegrationKind };

  return <IntegrationsSidebar {...extendedProps} />;
};

SidebarContainer.propTypes = {
  history: PropTypes.object
};

export default withRouter(SidebarContainer);
