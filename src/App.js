import React from "react";

import { HashRouter, Route, Routes } from "react-router-dom";

import Titlebar from "./pages/components/titlebar.js";

import Main from "./pages/index.js";
import Login from "./pages/login.js";

import "./App.css";

function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path='/' element={<Main />} />
                <Route path='/login' element={<Login />} />
            </Routes>
            <Titlebar />
        </HashRouter>
    );
}

export default App;
