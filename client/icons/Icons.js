import React from 'react';

const attrs = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: '24',
  height: '40',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: '#fff',
  strokeWidth: '2',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const iconPlus = (
  <svg {...attrs} width="20" className="icon" >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const iconLeft = (
  <svg {...attrs}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const iconRight = (
  <svg {...attrs} height="20">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const iconExit = (
  <svg {...attrs} width="18">
    <path d="M10 22H5a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h5" />
    <polyline points="17 16 21 12 17 8" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const iconAttach = (
  <svg {...attrs} width="18" height="35" stroke="#686868">
    <path
      d="M21.44,11.05l-9.19,9.19a6,6,0,0,1-8.49-8.49l9.19-9.19a4,
      4,0,0,1,5.66,5.66L9.41,17.41a2,2,0,0,1-2.83-2.83L15.07,6.1"
    />
  </svg>
);

const iconClose = (
  <svg {...attrs} width="18">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>

);

export {
  iconPlus,
  iconLeft,
  iconRight,
  iconExit,
  iconAttach,
  iconClose,
};
