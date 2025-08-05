import React from 'react';

const Spinner = ({ size = '50px', color = 'blue' }) => {
  const spinnerStyle = {
    width: size,
    height: size,
    border: `5px solid ${color}`,
    borderTop: '5px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  return <div style={spinnerStyle}></div>;
};

export default Spinner;
