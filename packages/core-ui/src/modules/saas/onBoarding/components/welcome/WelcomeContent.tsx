import Carousel from 'react-bootstrap/Carousel';
import { CarouselWrapper } from 'modules/saas/onBoarding/styles';
import React from 'react';
import { WELCOME_CAROUSELS } from 'modules/saas/onBoarding/constants';

type Props = {};

const WelcomeContent = ({}: Props) => {
  const renderCarousel = () => {
    return WELCOME_CAROUSELS.map((item) => (
      <Carousel.Item key={item.id}>
        <div className="image-wrapper">
          <img className="d-block w-100" src={item.image} alt={item.title} />
        </div>
        <Carousel.Caption>
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </Carousel.Caption>
      </Carousel.Item>
    ));
  };

  return (
    <CarouselWrapper>
      <Carousel interval={5000}>{renderCarousel()}</Carousel>
    </CarouselWrapper>
  );
};

export default WelcomeContent;
