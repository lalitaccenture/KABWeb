import React from 'react';

interface ProgressBarProps {
  width: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ width }) => {
  return (
    <div className="w-full max-w-[1000px] h-2 bg-white rounded-full">
      <div className="h-full bg-[#3AAD73] rounded-full" style={{ width: `${width}%` }}></div>
    </div>
  );
};

export default ProgressBar;
