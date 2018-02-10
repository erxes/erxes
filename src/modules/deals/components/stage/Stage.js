import React from 'react';
import PropTypes from 'prop-types';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { StageContainer, StageBody, AddNewDeal } from '../../styles';
import { Icon } from 'modules/common/components';
import { Deal, DealForm } from '../';

const propTypes = {
  stage: PropTypes.object.isRequired,
  deals: PropTypes.array.isRequired,
  index: PropTypes.number.isRequired,
  addDealForm: PropTypes.func.isRequired,
  closeDealForm: PropTypes.func.isRequired,
  showDealForm: PropTypes.object.isRequired
};

class Stage extends React.Component {
  constructor(props) {
    super(props);

    let amount = 0;

    props.deals.forEach(deal => {
      amount += deal.amount;
    });

    this.state = {
      amount
    };
  }

  componentDidUpdate(prevProps) {
    // console.log(prevProps.deals.length);
    // console.log(this.props.deals.length);
    // let amount = 0;
    // this.props.deals.forEach(deal => {
    //   amount += deal.amount;
    // });
    // this.setState({
    //   amount,
    // });
  }

  render() {
    const { stage, deals, index } = this.props;
    const { amount } = this.state;

    return (
      <Draggable draggableId={stage._id} index={index}>
        {provided => {
          return (
            <StageContainer
              innerRef={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <h3>
                {stage.name} {amount}
              </h3>
              <Droppable droppableId={stage._id} type="DEAL">
                {dropProvided => (
                  <StageBody innerRef={dropProvided.innerRef}>
                    <div>
                      {deals.map((deal, i) => (
                        <Deal key={deal._id} deal={deal} index={i} />
                      ))}
                    </div>
                    {dropProvided.placeholder}
                  </StageBody>
                )}
              </Droppable>
              {this.props.showDealForm[stage._id] ? (
                <DealForm
                  addDeal={() => {}}
                  close={this.props.closeDealForm.bind(this, stage._id)}
                />
              ) : (
                <AddNewDeal
                  onClick={this.props.addDealForm.bind(this, stage._id)}
                >
                  <Icon icon="plus" /> Add new deal
                </AddNewDeal>
              )}
            </StageContainer>
          );
        }}
      </Draggable>
    );
  }
}

export default Stage;

Stage.propTypes = propTypes;
