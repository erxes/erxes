import Carousel from "modules/common/components/Carousel";
import { CarouselWrapper } from "modules/saas/onBoarding/styles";
import React from "react";
import { WELCOME_CAROUSELS } from "modules/saas/onBoarding/constants";

type Props = {};

const WelcomeContent = ({}: Props) => {
  return (
    <CarouselWrapper>
      <Carousel intervalTime={5000} items={WELCOME_CAROUSELS} />
    </CarouselWrapper>
  );
};

export default WelcomeContent;
