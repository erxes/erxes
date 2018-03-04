import React from 'react';
import PropTypes from 'prop-types';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import {
  StageWrapper,
  StageContainer,
  StageHeader,
  StageBody,
  StageDropZone,
  AddNewDeal
} from '../../styles';
import { Icon } from 'modules/common/components';
import { Deal } from '../';
import { DealForm } from '../../containers';
import { listObjectUnFreeze } from 'modules/common/utils';

const propTypes = {
  stage: PropTypes.object.isRequired,
  boardId: PropTypes.string,
  pipelineId: PropTypes.string,
  deals: PropTypes.array,
  dealsFromDb: PropTypes.array,
  index: PropTypes.number.isRequired,
  collectDeals: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired
};

class Stage extends React.Component {
  constructor(props) {
    super(props);

    this.showForm = this.showForm.bind(this);
    this.closeForm = this.closeForm.bind(this);

    props.collectDeals(props.stage._id, listObjectUnFreeze(props.dealsFromDb));

    this.state = {
      amount: {},
      show: false
    };
  }

  showForm() {
    this.setState({
      show: true
    });
  }

  closeForm() {
    this.setState({
      show: false
    });
  }

  componentWillReceiveProps(nextProps) {
    if (
      JSON.stringify(this.props.dealsFromDb) !==
      JSON.stringify(nextProps.dealsFromDb)
    ) {
      this.props.collectDeals(
        this.props.stage._id,
        listObjectUnFreeze(nextProps.dealsFromDb)
      );
    }

    if (nextProps.deals.length > 0) {
      const amount = {};
      nextProps.deals.forEach(deal => {
        Object.keys(deal.amount).forEach(key => {
          if (!amount[key]) amount[key] = deal.amount[key];
          else amount[key] += deal.amount[key];
        });
      });

      this.setState({ amount });
    }
  }

  render() {
    const { stage, pipelineId, boardId, deals, refetch } = this.props;

    const amount = this.state.amount;

    return (
      <Draggable draggableId={stage._id} index={this.props.index}>
        {(provided, snapshot) => {
          return (
            <StageWrapper>
              <StageContainer
                innerRef={provided.innerRef}
                {...provided.draggableProps}
                isDragging={snapshot.isDragging}
              >
                <StageHeader {...provided.dragHandleProps}>
                  <h3>{stage.name}</h3>
                  {Object.keys(amount).length > 0 ? (
                    <ul>
                      {Object.keys(amount).map(key => (
                        <li key={key}>
                          {amount[key].toLocaleString()} {key}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <span className="deals-count">Deal: {deals.length}</span>
                </StageHeader>
                <StageBody>
                  <Droppable droppableId={stage._id} type="DEAL">
                    {dropProvided => (
                      <StageDropZone innerRef={dropProvided.innerRef}>
                        <div>
                          {deals.map((deal, index) => (
                            <Deal
                              key={deal._id}
                              deal={deal}
                              index={index}
                              refetch={refetch}
                            />
                          ))}
                        </div>
                        {dropProvided.placeholder}
                      </StageDropZone>
                    )}
                  </Droppable>
                  {this.state.show ? (
                    <DealForm
                      boardId={boardId}
                      pipelineId={pipelineId}
                      stageId={stage._id}
                      refetch={refetch}
                      close={this.closeForm.bind(this)}
                      dealsLength={deals.length}
                    />
                  ) : (
                    <AddNewDeal onClick={this.showForm.bind(this)}>
                      <Icon icon="plus" /> Add new deal
                    </AddNewDeal>
                  )}
                </StageBody>
              </StageContainer>
            </StageWrapper>
          );
        }}
      </Draggable>
    );
  }
}

export default Stage;

Stage.propTypes = propTypes;
