import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import ErrorDialog from '../components/ErrorDialog';
import SuccessDialog from '../components/SuccessDialog';
import Spinner from '../components/Spinner';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

function ResetPassword() {
  const { userId, token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!userId || !token) {
      setErrorMessage('Invalid reset link. Please request a new password reset.');
    }
  }, [userId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post('/auth/reset-password', {
        userId,
        token,
        newPassword: password,
      });
      
      setSuccessMessage('Password reset successfully! Redirecting to login...');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to reset password. The link may have expired.';
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-200 px-8 md:px-20">
      <div className="flex flex-col items-center justify-center lg:ml-36 w-full p-4 md:p-6 md:w-1/2">
        <h1 className="text-6xl font-bold mb-4 text-primary">VidShare</h1>
        <p className="text-xl text-black">Set a new password for your account.</p>
      </div>
      <div className="flex flex-col justify-center items-center w-full p-4 md:p-6 md:w-1/2 lg:mr-36">
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Reset Password</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">New Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded pr-10"
                  required
                  minLength={6}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Confirm Password</label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded pr-10"
                  required
                  minLength={6}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading || !userId || !token} 
              className={`w-full bg-primary text-white py-2 rounded ${loading || !userId || !token ? 'opacity-50 pointer-events-none' : ''}`}
            >
              {loading ? <Spinner loading={loading} size={20} /> : 'Reset Password'}
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

export default ResetPassword;

