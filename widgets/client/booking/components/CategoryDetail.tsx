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
  goToIntro: () => void;
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
      goToProduct,
      goToIntro
    } = this.props;

    if (!category || !booking) {
      return null;
    }

    const { categoryTree, style } = booking;
    const { name, attachment = {} } = category;

    // use this
    let childs = categoryTree.filter(
      tree => tree.parentId === category._id && tree.type === 'category'
    );

    if (childs.length < 1) {
      childs = categoryTree.filter(
        tree => tree.parentId === category._id && tree.type === 'product'
      );
    }

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
      this.setState({ activeChild: el });

      setTimeout(() => {
        goNext();
      }, 100);
    };

    return (
      <>
        <>
          <div className="title text-center">
            <h4> {name}</h4>
            <p className="text-center"> {category.description} </p>
          </div>

          <div className="category-detail">
            <div className="img-container mr-30">
              <img
                src={readFile(attachment && attachment.url)}
                alt={attachment && attachment.title}
                style={{
                  maxHeight: '100%',
                  maxWidth: '100%'
                }}
              />
            </div>
            <div className={`flex-cards right-sidebar`}>
              {childs.map(el => {
                return (
                  <React.Fragment key={el._id}>
                    <Card
                      title={el.name}
                      style={style}
                      status={el.status}
                      count={el.count}
                      onClick={() => selectCard(el)}
                    />
                  </React.Fragment>
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
                  : category.parentId === booking.productCategoryId
                  ? goToBookings()
                  : goToIntro()
              }
              style={{ backgroundColor: style.widgetColor, left: 0 }}
            />
          </div>
        </>
      </>
    );
  }
}

export default CategoryDetail;
