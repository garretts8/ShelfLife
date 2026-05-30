//Provides UI button for Google Sign-In and handles authentication flow.

import { GoogleLogin as StandardGoogleLogin } from '@react-oauth/google';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const GoogleLogin = () => {
    const { googleLogin } = useAuth();  // Changed from login to googleLogin

    return (
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <StandardGoogleLogin
                onSuccess={async (credentialResponse) => {
                    console.log('Credential response received');

                    try {
                        // Send the Google credential (ID token) to your backend
                        const res = await api.post('/auth/google', {
                            token: credentialResponse.credential
                        });

                        // Save token to localStorage
                        localStorage.setItem('token', res.data.token);
                        
                        // Update auth context with user data
                        googleLogin(res.data.user);  // Changed from login to googleLogin
                        
                        // Redirect to dashboard
                        window.location.href = '/dashboard';
                    } catch (error) {
                        console.error('Backend error:', error.response?.data || error.message);
                        alert(`Login failed: ${error.response?.data?.message || error.message}`);
                    }
                }}
                onError={() => {
                    console.error('Google Login Failed');
                    alert('Google login failed. Please try again.');
                }}
            />
        </div>
    );
};

export default GoogleLogin;