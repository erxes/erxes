import React from 'react';
import PropTypes from 'prop-types';
import { Layout } from '../styles';
import Navigation from './Navigation';


const propTypes = {
  content: PropTypes.element,
};

function MainLayout({ content }) {

  return (
    <Layout>
      <Navigation />
      {content}
    </Layout>
  );
}

MainLayout.propTypes = propTypes;

export default MainLayout;
