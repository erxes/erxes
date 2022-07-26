import React from 'react';
import Icon from '@erxes/ui/src/components/Icon';
import {
  CarouselWrapper,
  Buttons,
  SliderButton,
  Dots,
  Dot,
  Image
} from '../../styles';

type Props = {
  dataSlider: string[];
};

type State = {
  slideIndex: any;
};

class Carousel extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      slideIndex: 0
    };
  }

  renderButtons(slideIndex, dataSlider) {
    const nextSlide = () => {
      this.setState({ slideIndex: slideIndex + 1 });
    };

    const prevSlide = () => {
      this.setState({ slideIndex: slideIndex - 1 });
    };

    return (
      <Buttons
        placement={
          slideIndex === dataSlider.length - 1
            ? 'start'
            : slideIndex === 0
            ? 'end'
            : 'space-between'
        }
      >
        <SliderButton active={slideIndex !== 0} onClick={prevSlide}>
          <Icon icon="leftarrow-3" size={20} />
        </SliderButton>
        <SliderButton
          active={slideIndex !== dataSlider.length - 1}
          onClick={nextSlide}
        >
          <Icon icon="chevron" size={20} />
        </SliderButton>
      </Buttons>
    );
  }

  renderDots(slideIndex, dataSlider) {
    const moveDot = index => {
      this.setState({ slideIndex: index });
    };

    return (
      <>
        {dataSlider.length > 1 && (
          <Dots>
            {dataSlider.map((url, index) => {
              return (
                <Dot
                  key={index}
                  active={slideIndex === index}
                  onClick={() => moveDot(index)}
                />
              );
            })}
          </Dots>
        )}
      </>
    );
  }

  render() {
    const { slideIndex } = this.state;
    const { dataSlider } = this.props;

    return (
      <CarouselWrapper>
        {dataSlider.map((url, index) => {
          return <>{slideIndex === index && <Image src={url} key={index} />}</>;
        })}

        {this.renderButtons(slideIndex, dataSlider)}
        {this.renderDots(slideIndex, dataSlider)}
      </CarouselWrapper>
    );
  }
}

export default Carousel;
