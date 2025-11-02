import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {getUserDetails} from '../utils/Database';
import {UserInterface} from '../utils/Interfaces';

function HomePage() {
    const [userData, setUserData] = useState<UserInterface|null>(null);
    const pageStyle: React.CSSProperties = {
        height: '100vh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        textAlign: 'center',
        paddingLeft: '50px',
        paddingRight: '50px'
    };

    useEffect(()=>{
        if(!userData)
        {
            const fetchData = async ()=>{
                const user = await getUserDetails();
                if(user) setUserData(user);
            }
            fetchData();
        }
    });
    
    return (
        <div style={pageStyle}>
            <h1 style={{ color: '#000000ff' }}>
                Welcome to Live MART
            </h1>
            <p style={{ fontSize: '18px', color: '#000000ff' }}>
                Your one-stop online delivery system.
            </p>
            {(userData)?
            <text style={{ fontSize: '18px', color: '#000000ff' }}>Hello {userData!.name}</text>
            :
            <Link to="/register" style={{ fontSize: '20px', color: '#00008B' }}>
                Go to Registration Page
            </Link>
            }
        </div>
    );
}

export default HomePage;