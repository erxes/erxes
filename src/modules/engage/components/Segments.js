import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Wrapper } from 'modules/layout/components';
import { SidebarList, SidebarCounter } from 'modules/layout/styles';
import { EmptyState, Icon } from 'modules/common/components';
import styled from 'styled-components';
import { colors } from 'modules/common/styles';

const Li = styled.li`
  list-style-type: none;
  text-align: left;
  display: list-item;
  background-color: ${props =>
    props.chosen ? colors.borderPrimary : 'transparent'};
`;

const propTypes = {
  segments: PropTypes.array.isRequired,
  onChangeSegments: PropTypes.func.isRequired,
  defaultSegment: PropTypes.string,
  counts: PropTypes.object
};

class Segments extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chosenSegment: props.defaultSegment || ''
    };

    this.onClickSegment = this.onClickSegment.bind(this);
  }

  onClickSegment(segmentId) {
    if (segmentId === this.state.chosenSegment) {
      this.setState({ chosenSegment: '' });
    } else {
      this.props.onChangeSegments(segmentId);
      this.setState({ chosenSegment: segmentId });
    }
  }

  render() {
    const { segments, counts } = this.props;
    const { Section } = Wrapper.Sidebar;

    const orderedSegments = [];

    segments.forEach(segment => {
      if (!segment.subOf) {
        orderedSegments.push(segment, ...segment.getSubSegments);
      }
    });

    return (
      <Section collapsible={segments.length > 5}>
        <Section.Title>Choose segment</Section.Title>
        <SidebarList>
          {orderedSegments.length ? (
            orderedSegments.map(segment => (
              <Li
                key={segment._id}
                chosen={this.state.chosenSegment === segment._id ? true : false}
              >
                <a
                  tabIndex={0}
                  className={
                    this.state.chosenSegment === segment._id ? 'chosen' : ''
                  }
                  onClick={() => this.onClickSegment(segment._id)}
                >
                  {segment.subOf ? '\u00a0\u00a0\u00a0\u00a0\u00a0' : null}
                  <Icon
                    icon="pie-graph icon"
                    style={{ color: segment.color }}
                  />
                  {segment.name}
                  <SidebarCounter>{counts[segment._id]}</SidebarCounter>
                </a>
              </Li>
            ))
          ) : (
            <EmptyState icon="pie-graph" text="No segments" size="small" />
          )}
        </SidebarList>
      </Section>
    );
  }
}

Segments.propTypes = propTypes;

export default Segments;
