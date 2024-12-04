import React from "react";
import { useNavigate } from "react-router-dom";
import '../css/App.css';

function HomePage(){
    const navigate = useNavigate();

    return (
        <div className="App">
            <img src="/JITRI-logo2.png" alt="logo"></img>
            <header className="App-header">
                <h1>
                集萃新材料研发有限公司
                </h1>
            </header>
            <div className="homeButtonGroup">

                <button onClick={() => navigate('/customer')} className="homeButton">
                新增委托方
                </button>
                <button onClick={() => navigate('/payment')} className="homeButton">
                新增付款方
                </button>
            </div>
            <button onClick={() => navigate('/form')} className="fillin-button">
                填写委托单
                </button>
            <footer class="footer">
                <p>© 2024 Materials Academy, JITRI. All rights reserved.</p>
            </footer>
        </div>
    )
}

export default HomePage;