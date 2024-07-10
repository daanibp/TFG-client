import React from "react";
import "../estilos/Loading.css";

const LoadingIndicator = () => {
    return (
        <div className="loading-container">
            <div className="container">
                <div className="cubo">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div className="Loading">
                    <div>
                        <h1>Cargando</h1>
                        <p>...</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoadingIndicator;
