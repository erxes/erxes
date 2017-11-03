import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import { Wrapper } from 'modules/layout/components';
import { LoadingWrapper, LoadingItem, LineWrapper, Line } from './styles';

const propTypes = {
  items: PropTypes.number,
  wide: PropTypes.bool
};

function LoadingSidebar({ items, wide }) {
  return (
    <Wrapper.Sidebar wide={wide}>
      {_.times(items, n => <Section key={n} />)}
    </Wrapper.Sidebar>
  );
}

function Section() {
  return (
    <Wrapper.Sidebar.Section>
      <LoadingWrapper>
        <Lines title />
      </LoadingWrapper>
    </Wrapper.Sidebar.Section>
  );
}

function Lines({ title }) {
  return (
    <LoadingItem>
      <LineWrapper>
        {title ? <Line className="title width40 animate" /> : null}
        <Line className="width85 animate" />
        <Line className="width65 animate" />
        <Line className="width85 animate" />
        <Line className="width70 animate" />
        <Line className="animate" />
      </LineWrapper>
    </LoadingItem>
  );
}

Lines.propTypes = {
  title: PropTypes.bool
};

LoadingSidebar.Section = Section;
LoadingSidebar.Lines = Lines;
LoadingSidebar.propTypes = propTypes;

export default LoadingSidebar;
