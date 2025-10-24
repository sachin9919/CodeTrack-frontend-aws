import React from 'react';
// We assume index.css or App.css contains the .spinner styles

const Spinner = ({ size = 'large' }) => {
    return (
        <div className="spinner-container">
            <div className={`spinner ${size === 'small' ? 'small' : ''}`}></div>
        </div>
    );
};

export default Spinner;