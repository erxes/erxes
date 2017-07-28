import React, { PropTypes } from 'react';
import { Topic } from '../containers';


const propTypes = {
  activeRoute: PropTypes.string.isRequired,
};

function KnowledgeBase() {
  return <Topic />;
}

KnowledgeBase.propTypes = propTypes;

export default KnowledgeBase;
