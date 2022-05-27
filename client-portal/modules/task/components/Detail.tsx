import React from "react";
import Modal from "../../common/Modal";
import { DetailContent, Priority } from "../../styles/tasks";
import { ModalWrapper } from "../../styles/main";
import PriorityIndicator from "../../common/PriorityIndicator";

type Props = {
  item?: any;
  renderDate: (date: Date) => React.ReactNode;
  onClose: () => void;
};

export default class TaskDetail extends React.Component<Props> {
  render() {
    const { item, onClose, renderDate } = this.props;

    if (!item) {
      return null;
    }

    const content = () => (
      <DetailContent>
        <h4> {item.name}</h4>
        <div className="flex-between mb-10">
          <div className="content">
            <span>
              <img
                src="https://erxes.io/static/images/team/square/mungunshagai.jpg"
                alt="profile"
              />
              <b>Anu-ujin Bat-Ulzii</b>
            </span>
            Posted on {renderDate(item.createdAt)}
          </div>
          {item.priority && (
            <Priority>
              <PriorityIndicator value={item.priority} /> {item.priority}
            </Priority>
          )}
        </div>
        <p>{item.description}</p>
      </DetailContent>
    );

    return (
      <ModalWrapper isFull={true}>
        <Modal
          content={content}
          onClose={onClose}
          isOpen={item ? true : false}
        />
      </ModalWrapper>
    );
  }
}
