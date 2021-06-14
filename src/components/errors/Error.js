import React from 'react';
import "./Error.css";

class Error extends React.Component {
    render() {
        return (
            <div className="error-container">
                <div className="error-message">{this.props.errorMessage}</div>
            </div>
        );
    }
}

export default Error;
