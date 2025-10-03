export const CircularProgressBar = ({ percentage }: { percentage: number }) => {
  const size = 16;
  const stroke = 2;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg height={size} width={size}>
      <circle
        stroke="#d6d6d6"
        fill="transparent"
        strokeWidth={stroke}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke="#4caf50"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={`${circumference} ${circumference}`}
        style={{
          strokeDashoffset,
          transition: 'stroke-dashoffset 0.5s',
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
        }}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
    </svg>
  );
};
