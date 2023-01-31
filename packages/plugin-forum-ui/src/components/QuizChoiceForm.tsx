import React, { useEffect } from 'react';
import { useQuery } from 'react-apollo';
import gql from 'graphql-tag';
import { CATEGORIES_ALL } from '../graphql/queries';
import { Modal } from 'react-bootstrap';

export type ChoiceEditable = {
  imageUrl?: string;
  isCorrect: boolean;
  listOrder: number;
  text?: string;
};

export type Choice = { _id: string; questionId: string } & ChoiceEditable;

type Props = {
  choice?: ChoiceEditable;
  onSubmit(question: ChoiceEditable): any;
  onCancel(): any;
  show: boolean;
};

const QuizChoiceForm: React.FC<Props> = ({
  choice,
  onSubmit,
  show,
  onCancel
}) => {
  const [text, setText] = React.useState(choice?.text || '');
  const [imageUrl, setImageUrl] = React.useState(choice?.imageUrl || '');
  const [isCorrect, setIsCorrect] = React.useState(choice?.isCorrect || false);
  const [listOrder, setListOrder] = React.useState(
    String(choice?.listOrder) || '0'
  );

  useEffect(() => {
    if (show) {
      setText(choice?.text || '');
      setImageUrl(choice?.imageUrl || '');
      setIsCorrect(choice?.isCorrect || false);
      setListOrder(String(choice?.listOrder) || '0');
    }
  }, [show]);

  const _onSubmit = e => {
    e.preventDefault();
    onSubmit({
      text,
      imageUrl,
      isCorrect,
      listOrder: Number(listOrder) || 0
    });
  };

  return (
    <Modal size={'xl'} show={show} enforceFocus centered>
      <Modal.Body>
        <form onSubmit={_onSubmit}>
          <div className="form-group">
            <label htmlFor="text">Text</label>
            <input
              type="text"
              className="form-control"
              id="text"
              value={text}
              onChange={e => setText(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="imageUrl">Image URL</label>
            <input
              type="text"
              className="form-control"
              id="imageUrl"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="isCorrect">Is Correct </label>
            <input
              type="checkbox"
              id="isCorrect"
              checked={isCorrect}
              onChange={e => setIsCorrect(e.target.checked)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="listOrder">List Order</label>
            <input
              type="number"
              className="form-control"
              id="listOrder"
              value={listOrder}
              onChange={e => setListOrder(e.target.value)}
            />
          </div>

          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit">Submit</button>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default QuizChoiceForm;
