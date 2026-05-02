import { GoogleLogin as StandardGoogleLogin } from '@react-oauth/google';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const GoogleLogin = () => {
    const { login } = useAuth();

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

                        // Save token and user info
                        localStorage.setItem('token', res.data.token);
                        login(res.data.user);

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