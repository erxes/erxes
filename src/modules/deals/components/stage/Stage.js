import React from 'react';
import PropTypes from 'prop-types';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import {
  StageWrapper,
  StageContainer,
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
  addDealForm: PropTypes.func.isRequired,
  closeDealForm: PropTypes.func.isRequired,
  collectDeals: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
  showDealForm: PropTypes.object.isRequired
};

class Stage extends React.Component {
  constructor(props) {
    super(props);

    props.collectDeals(props.stage._id, listObjectUnFreeze(props.dealsFromDb));
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.dealsFromDb.length !== nextProps.dealsFromDb.length) {
      this.props.collectDeals(
        this.props.stage._id,
        listObjectUnFreeze(nextProps.dealsFromDb)
      );
    }
  }

  render() {
    const {
      stage,
      pipelineId,
      boardId,
      deals,
      refetch,
      showDealForm,
      closeDealForm
    } = this.props;

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
                <h3 {...provided.dragHandleProps}>
                  {stage.name} <span>Deal: {deals.length}</span>
                </h3>
                <StageBody>
                  <Droppable droppableId={stage._id} type="DEAL">
                    {dropProvided => (
                      <StageDropZone innerRef={dropProvided.innerRef}>
                        <div>
                          {deals.map((deal, index) => (
                            <Deal key={deal._id} deal={deal} index={index} />
                          ))}
                        </div>
                        {dropProvided.placeholder}
                      </StageDropZone>
                    )}
                  </Droppable>
                  {showDealForm[stage._id] ? (
                    <DealForm
                      boardId={boardId}
                      pipelineId={pipelineId}
                      stageId={stage._id}
                      refetch={refetch}
                      close={closeDealForm.bind(this, stage._id)}
                      dealsLength={deals.length}
                    />
                  ) : (
                    <AddNewDeal
                      onClick={this.props.addDealForm.bind(this, stage._id)}
                    >
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
