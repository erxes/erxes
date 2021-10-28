import * as React from 'react';
import Button from './common/Button';
import Card from '../components/common/Card';
import { IBookingData } from '../types';
import { IProductCategory } from '../../types';
import { readFile, __ } from '../../utils';

type Props = {
  goToBookings: () => void;
  category?: IProductCategory;
  booking?: IBookingData;
  goToCategory: (categoryId: string) => void;
  goToProduct: (productId: string) => void;
};

class CategoryDetail extends React.Component<Props> {
  constructor(props: Props) {
    super(props);

    this.state = {
      activeChild: ''
    };
  }

  render() {
    const {
      category,
      booking,
      goToBookings,
      goToCategory,
      goToProduct
    } = this.props;

    if (!category || !booking) {
      return null;
    }

    const { categoryTree } = booking;
    const { widgetColor } = booking.style;

    // use this
    let childs = categoryTree.filter(
      tree => tree.parentId === category._id && tree.type === 'category'
    );

    if (childs.length < 1) {
      childs = categoryTree.filter(
        tree => tree.parentId === category._id && tree.type === 'product'
      );
    }

    return (
      <>
        <div className="container">
          <h4> {category.name} </h4>
          <p> {category.description} </p>
          <div className="flex-sa">
            <div className="img-container w-50">
              <img
                src={readFile(category.attachment && category.attachment.url)}
                alt={category.attachment && category.attachment.title}
                style={{
                  maxHeight: '100%',
                  maxWidth: '100%'
                }}
              />
            </div>
            <div className="cards w-50">
              {childs.map(el => {
                return (
                  <div
                    key={el._id}
                    onClick={() =>
                      el.type === 'category'
                        ? goToCategory(el._id)
                        : goToProduct(el._id)
                    }
                  >
                    <Card
                      type={'category'}
                      title={el.name}
                      widgetColor={widgetColor}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div />
        <div className="footer">
          <Button
            text={__('Back')}
            type="back"
            onClickHandler={goToBookings}
            style={{ backgroundColor: widgetColor }}
          />
          <Button
            text={__('Next')}
            type="back"
            onClickHandler={goToBookings}
            style={{ backgroundColor: widgetColor }}
          />
        </div>
      </>
    );
  }
}

export default CategoryDetail;
