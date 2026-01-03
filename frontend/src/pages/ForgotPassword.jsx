import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import ErrorDialog from '../components/ErrorDialog';
import SuccessDialog from '../components/SuccessDialog';
import Spinner from '../components/Spinner';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await axiosInstance.post('/auth/forgot-password', { email });
      setSuccessMessage(response.data.message || 'Password reset link has been sent to your email.');
      setEmail('');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to send reset email. Please try again.';
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-200 px-8 md:px-20">
      <div className="flex flex-col items-center justify-center lg:ml-36 w-full p-4 md:p-6 md:w-1/2">
        <h1 className="text-6xl font-bold mb-4 text-primary">VidShare</h1>
        <p className="text-xl text-black">Reset your password to continue.</p>
      </div>
      <div className="flex flex-col justify-center items-center w-full p-4 md:p-6 md:w-1/2 lg:mr-36">
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Forgot Password</h1>
          <p className="text-sm text-gray-600 mb-4 text-center">
            Enter your email address and we'll send you a link to reset your password.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full p-2 border border-gray-300 rounded"
                required
                placeholder="Enter your email"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full bg-primary text-white py-2 rounded ${loading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {loading ? <Spinner loading={loading} size={20} /> : 'Send Reset Link'}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <p>
              Remember your password?{' '}
              <Link to="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
        
        {errorMessage && (
          <ErrorDialog message={errorMessage} onClose={() => setErrorMessage('')} />
        )}
        {successMessage && (
          <SuccessDialog message={successMessage} onClose={() => setSuccessMessage('')} />
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;

