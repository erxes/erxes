import * as React from 'react';
import { IProductCategory } from '../types';
import { readFile } from '../../utils';
import { BackButton } from './common';

type Props = {
  goToBookings?: () => void;
  block?: IProductCategory;
};

function BlockDetail({ goToBookings, block }: Props) {
  if (!block) {
    return null;
  }
  return (
    <div className="main-container">
      <div className="main-header">
        <div className="flex-center b mb-10">{block.name}</div>
        <div className="flex-center mb-10">{block.description}</div>
        <div className="main-body">
          <img
            src={readFile(block.attachment && block.attachment.url)}
            alt="hello"
          />
        </div>

        <div className="flex-sb w-100">
          <button className="btn btn-back" onClick={goToBookings}>
            <i className="icon-arrow-left" />
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default BlockDetail;
