import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import Spinner from './Spinner';
import ErrorDialog from './ErrorDialog';
import SuccessDialog from './SuccessDialog';

const VerifyEmail = () => {
    const { userId, token } = useParams();
    const [message, setMessage] = useState('Verifying your email...');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();
    
    useEffect(() => {
        const verifyUser = async () => {
            if (!userId || !token) {
                setError('Invalid verification link. Please check your email and try again.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await axiosInstance.get(`/users/verify/${userId}/${token}`);
                setMessage(response.data.message || 'Email verified successfully!');
                setSuccess(true);
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } catch (error) {
                const errorMsg = error.response?.data?.message || error.message || 'Error verifying email. The link may have expired.';
                setError(errorMsg);
                setMessage(errorMsg);
            } finally {
                setLoading(false);
            }
        };

        verifyUser();
    }, [userId, token, navigate]);

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-gray-200 px-8 md:px-20">
            <div className="flex flex-col items-center justify-center lg:ml-36 w-full p-4 md:p-6 md:w-1/2">
                <h1 className="text-6xl font-bold mb-4 text-primary">VidShare</h1>
                <p className="text-xl text-black">Email Verification</p>
            </div>
            <div className="flex flex-col justify-center items-center w-full p-4 md:p-6 md:w-1/2 lg:mr-36">
                <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md text-center">
                    {loading ? (
                        <div className="flex flex-col items-center">
                            <Spinner loading={loading} />
                            <p className="mt-4 text-gray-600">{message}</p>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-2xl font-bold mb-4">{success ? '✓ Email Verified!' : 'Verification Failed'}</h1>
                            <p className="text-gray-600 mb-4">{message}</p>
                            {success && (
                                <p className="text-sm text-gray-500">Redirecting to login page...</p>
                            )}
                            {!success && (
                                <button
                                    onClick={() => navigate('/login')}
                                    className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
                                >
                                    Go to Login
                                </button>
                            )}
                        </>
                    )}
                </div>
                {error && <ErrorDialog message={error} onClose={() => setError(null)} />}
                {success && <SuccessDialog message={message} onClose={() => setSuccess(false)} />}
            </div>
        </div>
    );
};

export default VerifyEmail;
