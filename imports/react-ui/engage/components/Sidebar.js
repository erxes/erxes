import React from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from '/imports/react-ui/layout/components';
import { TagFilter } from '/imports/react-ui/common';
import Main from './sidebar/Main';
import Status from './sidebar/Status';

function Sidebar({ tags }) {
  return (
    <Wrapper.Sidebar>
      <Main />
      <Status />
      <TagFilter
        tags={tags}
        publishCountName="engage.messages.tag."
        manageUrl="tags/engageMessage"
      />
    </Wrapper.Sidebar>
  );
}

Sidebar.propTypes = {
  tags: PropTypes.array.isRequired,
};

export default Sidebar;
