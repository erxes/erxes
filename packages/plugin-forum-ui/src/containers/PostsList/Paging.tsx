import React from 'react';

type Props = {
  buttons?: number;
  limit?: number;
  totalItems?: number;
  currentPageIndex?: number;
  goToPageIndex?: (page: number) => void;
};

const Paging: React.FC<Props> = ({
  buttons = 5,
  limit = 20,
  totalItems = 0,
  currentPageIndex = 0,
  goToPageIndex = () => {}
}) => {
  const totalPages = Math.floor((totalItems + limit - 1) / limit);

  let rightBoundGuess = currentPageIndex + Math.floor(buttons / 2) + 1;
  rightBoundGuess = Math.min(totalPages, rightBoundGuess);

  const leftBoundGuess = rightBoundGuess - buttons;
  const leftBound = Math.max(leftBoundGuess, 0);

  rightBoundGuess = leftBound + buttons;
  const rightBound = Math.min(totalPages, rightBoundGuess);

  const buttonNumbers: number[] = [];

  for (let i = leftBound; i < rightBound; i++) {
    buttonNumbers.push(i);
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
      <button
        disabled={currentPageIndex === 0}
        onClick={() => goToPageIndex(0)}
      >
        {'<<'}
      </button>
      <button
        disabled={currentPageIndex === 0}
        onClick={() => goToPageIndex(currentPageIndex - 1)}
      >
        {'<'}
      </button>

      {buttonNumbers.map(n => {
        return (
          <button
            disabled={n === currentPageIndex}
            onClick={() => goToPageIndex(n)}
          >
            {n + 1}
          </button>
        );
      })}

      <button
        disabled={currentPageIndex >= totalPages - 1}
        onClick={() => goToPageIndex(currentPageIndex + 1)}
      >
        {'>'}
      </button>
      <button
        disabled={currentPageIndex >= totalPages - 1}
        onClick={() => goToPageIndex(totalPages - 1)}
      >
        {'>>'}
      </button>
    </div>
  );
};

export default Paging;
