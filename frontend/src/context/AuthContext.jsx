import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

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