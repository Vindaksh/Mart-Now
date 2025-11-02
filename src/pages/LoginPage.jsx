import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

import Supabase from '../utils/Database';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const nav = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Login attempt:', { email, password });
        const {data, error} = await Supabase.auth.signInWithPassword({email:email, password:password});
        if(error){
            console.log("login failed: ",error);
        } else if(data.user){
            console.log("login successful");
            nav('/');
        }
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <h2>Welcome Back!</h2>

                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" className="submit-btn">
                    Login
                </button>

            </form>
            <p className="register-link">
                New to Live MART? <Link to="/register">Create an account</Link>
            </p>
        </div>
    );
}

export default LoginPage;