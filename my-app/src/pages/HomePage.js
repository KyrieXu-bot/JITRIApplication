import React from "react";
import { useNavigate } from "react-router-dom";
import '../css/App.css';

function HomePage(){
    const navigate = useNavigate();

    return (
        <div className="App">
        <header className="App-header">
            <h1>
            集萃检测
            </h1>
        </header>
        <button onClick={() => navigate('/form')}>
          填写委托单
        </button>
    </div>
    )
}

export default HomePage;