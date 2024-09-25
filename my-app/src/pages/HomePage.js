import React from "react";
import { useNavigate } from "react-router-dom";
import '../css/App.css';

function HomePage(){
    const navigate = useNavigate();

    return (
        <div className="App">
        <header className="App-header">
            <h1>
            欢迎来到集萃检测官网
            </h1>
        </header>
        <button onClick={() => navigate('/form')}>
          点此填写委托单
        </button>
    </div>
    )
}

export default HomePage;