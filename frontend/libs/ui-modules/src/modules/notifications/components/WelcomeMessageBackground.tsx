export const WelcomeMessageBackground = ({
  className,
}: {
  className?: string;
}) => {
  return (
    <div className={className}>
      <svg
        width="1262"
        height="728"
        viewBox="0 0 1262 728"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g opacity="0.25" filter="url(#filter0_f_0_1)">
          <path
            d="M934.315 -212.5C663.233 -357.375 337.563 56.4955 277.547 281.8C242.889 547.196 651.465 298.625 688.647 61.955C718.392 -127.381 864.819 -199.905 934.315 -212.5Z"
            fill="#4F46E5"
          />
        </g>
        <g opacity="0.25" filter="url(#filter1_f_0_1)">
          <path
            d="M326.923 397.533C598.005 542.408 923.674 128.538 983.691 -96.7667C1018.35 -362.162 609.772 -113.592 572.591 123.078C542.846 312.414 396.418 384.938 326.923 397.533Z"
            fill="#0EA5E9"
          />
        </g>
        <defs>
          <filter
            id="filter0_f_0_1"
            x="-24.5374"
            y="-542.56"
            width="1258.85"
            height="1238.68"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="150"
              result="effect1_foregroundBlur_0_1"
            />
          </filter>
          <filter
            id="filter1_f_0_1"
            x="26.9226"
            y="-511.09"
            width="1258.85"
            height="1238.68"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="BackgroundImageFix"
              result="shape"
            />
            <feGaussianBlur
              stdDeviation="150"
              result="effect1_foregroundBlur_0_1"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
};
