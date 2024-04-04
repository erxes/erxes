import { keyframes } from 'styled-components';

const rotate = keyframes`
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
	}
`;

const wave = keyframes`
  0%{
    transform:translateY(0px)
  }
  28%{
    transform:translateY(-5px)
  }
  44%{
    transform:translateY(0px)
  }
`;

const fadeIn = keyframes`
  0% {
    opacity: 0;
	}
	
  100% {
    opacity: 1;
  }
`;

const slideDown = keyframes`
  0% {
    transform: translateY(-20px);
    opacity: 0.7;
	}
	
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideRight = keyframes`
  0% {
    transform: translateX(20px);
    opacity: 0.7;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideLeft = keyframes`
  0% {
    transform: translateX(-20px);
    opacity: 0.7;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
`;

const shake = keyframes`
  0%{transform:rotate(-10deg)}
  28%{transform:rotate(10deg)}
  10%{transform:rotate(20deg)}
  18%{transform:rotate(-20deg)}
  28%{transform:rotate(20deg)}
  30%,100%{transform:rotate(0deg)}
`;

const twinkling = keyframes`
  from {
    background-position:0 0;
  }

  to {
    background-position:-10000px 5000px;
  }
`;

const stripe = keyframes`
  from {
    background-position: 16px 0;
  }
  to {
    background-position: 0 0;
  }
`;

const highlight = keyframes`
  0% { box-shadow: 0 0 -5px 0 #63D2D6; }
  40% { box-shadow: 0 0 10px 0 #63D2D6; }
  60% { box-shadow: 0 0 10px 0 #63D2D6; }
  100% { box-shadow: 0 0 -5px 0 #63D2D6; }
`;

const robotAnimation = keyframes`
  from {
    opacity: 0;
    -webkit-transform: scale(0.1) rotate(30deg);
    transform: scale(0.1) rotate(30deg);
    -webkit-transform-origin: center bottom;
    transform-origin: center bottom;
  }

  50% {
    -webkit-transform: rotate(-10deg);
    transform: rotate(-10deg);
  }

  70% {
    -webkit-transform: rotate(3deg);
    transform: rotate(3deg);
  }

  to {
    opacity: 1;
    -webkit-transform: scale(1);
    transform: scale(1);
  }
}`;

export {
  rotate,
  fadeIn,
  slideDown,
  slideLeft,
  slideRight,
  shake,
  twinkling,
  stripe,
  wave,
  robotAnimation,
  highlight,
};
