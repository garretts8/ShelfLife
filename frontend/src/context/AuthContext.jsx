//Handles user login, logout, and manages global authentication state using React Context.
//Provides user data and authentication status to other components via context.

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

//createContext - creates a context object that can be used to share data between components.
const AuthContext = createContext();

//useAuth hook - used by components to access authentication context
export const useAuth = () => useContext(AuthContext);

//AuthProvider component - wraps the application with authentication context provider
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Fetch user profile using the token to validate
            api.get('/auth/profile')
                .then(res => setUser(res.data))
                .catch(() => logout());
        }
        setLoading(false);
    }, []);

    //Login function
    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        setUser(data);
        return data;
    };

    //Logout function
    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
    };


    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};