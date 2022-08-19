import { keyframes } from 'styled-components';

const rotate = keyframes`
	from {
		transform: rotate(0deg);
	}

	to {
		transform: rotate(360deg);
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

export { rotate, slideDown };
