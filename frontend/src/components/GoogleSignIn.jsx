import React from 'react';
import axios from 'axios';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
const baseURL = import.meta.env.VITE_REACT_APP_BASE_URL;

const responseGoogleSuccess = async (credentialResponse) => {
    try {
        const res = await axios.post(`${baseURL}/auth/google`, {
            token: credentialResponse.credential
        });
    
        if(res.status === 200) {
            localStorage.setItem('accessToken', res.data.data.accessToken || res.data.accessToken);
            localStorage.setItem('refreshToken', res.data.data.refreshToken || res.data.data.user?.refreshToken || res.data.user?.refreshToken);

            window.location.href = '/';
        }
    } catch (error) {
        console.error('Google sign-in error:', error);
        alert('Google sign-in failed. Please try again or use email/password.');
    }
};

const responseGoogleFailure = (response) => {
    console.log("login failed ", response);
}

const GoogleSignIn = () => {
    const googleClientId = import.meta.env.VITE_REACT_APP_GOOGLE_CLIENT_ID;
    
    // Only show Google sign-in if client ID is configured
    if (!googleClientId || googleClientId === 'your-google-client-id') {
        return (
            <div className="w-full flex text-center justify-center mt-6">
                <p className="text-sm text-gray-500">Google sign-in is not configured</p>
            </div>
        );
    }

    return (
        <div className="w-full flex text-center justify-center mt-6">
            <GoogleOAuthProvider clientId={googleClientId}>
                <GoogleLogin
                    type='button'
                    text='Sign in with Google'
                    onSuccess={responseGoogleSuccess}
                    onError={responseGoogleFailure}
                />
            </GoogleOAuthProvider>
        </div>
    )
};

export default GoogleSignIn;
