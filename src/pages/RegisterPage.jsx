import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Register.css';
import RegistrationFlow from '../components/registration/RegistrationFlow';

function RegisterPage() {
    return (
        <div className="register-container">
            <RegistrationFlow/>
            <p className="login-link">
                    Already have an account? <Link to="/login">Login here</Link>
            </p>
        </div>
    );
}

export default RegisterPage;