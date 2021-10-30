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

type State = { activeChild: any };

class CategoryDetail extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      activeChild: {}
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

    const { categoryTree, style, description } = booking;

    // use this
    let childs = categoryTree.filter(
      tree => tree.parentId === category._id && tree.type === 'category'
    );

    if (childs.length < 1) {
      childs = categoryTree.filter(
        tree => tree.parentId === category._id && tree.type === 'product'
      );
    }

    let isCardSelected = false;
    const wrapperstyle = childs.length > 6 ? 'cards' : 'flex-cards';

    const goNext = () => {
      const count: string = this.state.activeChild.count!;
      const status =
        this.state.activeChild.status === 'disabled' || Number(count) === 0
          ? 'disabled'
          : '';

      if (
        this.state.activeChild &&
        this.state.activeChild._id !== null &&
        status !== 'disabled'
      ) {
        this.state.activeChild.type === 'category'
          ? goToCategory(this.state.activeChild._id)
          : goToProduct(this.state.activeChild._id);
      }
    };

    const selectCard = (el: any) => {
      if (this.state.activeChild._id !== el._id) {
        isCardSelected = true;
      }
      this.setState({ activeChild: el });
      setTimeout(() => {
        goNext();
      }, 100);
    };

    return (
      <>
        <div className="container">
          <h4> {category.name} </h4>
          <p> {description} </p>

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
            <div className={wrapperstyle}>
              {childs.map(el => {
                return (
                  // tslint:disable-next-line: jsx-key
                  <div onClick={() => selectCard(el)} key={el._id}>
                    <Card
                      title={el.name}
                      style={style}
                      status={el.status}
                      count={el.count}
                      isAnotherCardSelected={isCardSelected}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="footer">
            <Button
              text={__('Back')}
              type="back"
              onClickHandler={() =>
                category.parentId &&
                category.parentId !== booking.productCategoryId
                  ? goToCategory(category.parentId)
                  : goToBookings()
              }
              style={{ backgroundColor: style.widgetColor, left: 0 }}
            />
          </div>
        </div>
      </>
    );
  }
}

export default CategoryDetail;
