import React, { useState } from 'react';
import Logo from '../assets/images/logo.png';

const Login = () => {
    const [loginState, setLoginState] = useState({
        username: '',
        password: '',
    });

    const handleLoginChange = (e) => {
        setLoginState({
            ...loginState,
            [e.target.name]: e.target.value
        });
    };

    const handleLoginSubmit =(e)=>
    {
        e.preventDefault();
        const { username, password } = loginState;
    }

};