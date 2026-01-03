import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login, signUp } from '../features/UserSlice';
import { useNavigate, Link } from 'react-router-dom';
import ErrorDialog from '../components/ErrorDialog';
import SuccessDialog from '../components/SuccessDialog';
import GoogleSignIn from '../components/GoogleSignIn';
import Spinner from '../components/Spinner';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import axiosInstance from '../utils/axiosInstance';

function SignIn() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullname, setFullName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, user, error } = useSelector((state) => state.user);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (error) {
      setErrorMessage(error.message);
      setTimeout(() => {
        setErrorMessage('');
      }, 2000);
    }
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isLogin && password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (isLogin) {
      dispatch(login({ email, password })).then((result) => {
        if (result.type.includes('fulfilled')) {
          setEmail('');
          setPassword('');
          setSuccessMessage('Login successful!');
          setTimeout(() => {
            setSuccessMessage('');
          }, 2000);
        } else if (result.type.includes('rejected')) {
          // Extract error message from various possible formats
          let errorMsg = 'Login failed. Please check your credentials.';
          
          if (result.payload?.message) {
            errorMsg = result.payload.message;
          } else if (result.error?.message) {
            errorMsg = result.error.message;
          } else if (result.payload?.data?.message) {
            errorMsg = result.payload.data.message;
          }
          
          setErrorMessage(errorMsg);
          
          // Check if error is about email verification
          const lowerMsg = errorMsg.toLowerCase();
          if (lowerMsg.includes('verify') || lowerMsg.includes('verification') || lowerMsg.includes('check your inbox')) {
            setShowResendVerification(true);
            setResendEmail(email);
          }
        }
      });
    } else {
      dispatch(signUp({ fullname, email, username, password })).then((result) => {
        if (result.type.includes('fulfilled')) {
          setFullName('');
          setEmail('');
          setUsername('');
          setPassword('');
          setConfirmPassword('');
          const message = result.payload?.message || 'Signup successful! Please check your email to verify your account before logging in.';
          setSuccessMessage(message);
          setShowResendVerification(true);
          setResendEmail(email);
          setTimeout(() => {
            setSuccessMessage('');
          }, 5000);
        } else if (result.type.includes('rejected')) {
          // Better error message extraction
          let errorMsg = 'Signup failed. Please try again.';
          if (result.payload?.message) {
            errorMsg = result.payload.message;
          } else if (result.payload?.error) {
            errorMsg = result.payload.error;
          } else if (result.error?.message) {
            errorMsg = result.error.message;
          }
          
          // Log error for debugging
          console.error('Signup error:', result.payload || result.error);
          setErrorMessage(errorMsg);
        }
      }).catch((error) => {
        console.error('Signup dispatch error:', error);
        setErrorMessage('An unexpected error occurred. Please try again.');
      });
    }
  };

  const handleResendVerification = async () => {
    if (!resendEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setResendLoading(true);
    try {
      const response = await axiosInstance.post('/auth/resend-verification', { email: resendEmail });
      setSuccessMessage(response.data.message || 'Verification email sent! Please check your inbox.');
      setShowResendVerification(false);
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || 'Failed to send verification email. Please try again.';
      setErrorMessage(errorMsg);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row  bg-gray-200 px-8 md:px-20">
      <div className="flex flex-col items-center justify-center lg:ml-36 w-full p-4 md:p-6 md:w-1/2">
        <h1 className="text-6xl font-bold mb-4 text-primary">VidShare</h1>
        <p className="text-xl text-black">Share your favorite videos with the world.</p>
      </div>
      <div className="flex flex-col justify-center items-center w-full p-4 md:p-6 md:w-1/2 lg:mr-36">
        <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">{isLogin ? 'Login' : 'Signup'}</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm">Full Name</label>
                <input
                  name="fullname"
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm">Email</label>
              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            {!isLogin && (
              <div>
                <label className="block text-sm">Username</label>
                <input
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded pr-10"
                  required
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

            {!isLogin && (
              <div>
                <label className="block text-sm">Confirm Password</label>
                <div className="relative">
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded pr-10"
                    required
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
            )}
            
            <button type="submit" disabled={loading} className={`w-full bg-primary text-white py-2 rounded ${loading ? 'opacity-50 pointer-events-none': ''}`}>
             
              {loading ? <Spinner loading={loading} size={20} /> : isLogin ? 'Login' : 'Signup'}
            </button>



          </form>
          
          {/* Resend Verification Email Section */}
          {showResendVerification && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 mb-2">
                Your email needs to be verified before you can log in.
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 p-2 border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className={`px-4 py-2 bg-primary text-white rounded text-sm hover:bg-primary-dark ${resendLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {resendLoading ? <Spinner loading={resendLoading} size={16} /> : 'Resend'}
                </button>
              </div>
              <button
                onClick={() => setShowResendVerification(false)}
                className="mt-2 text-xs text-gray-600 hover:underline"
              >
                Close
              </button>
            </div>
          )}

          <div className="mt-4 text-center">
            {isLogin ? (
              <>
                <p>
                  Don't have an account?{' '}
                  <button onClick={() => setIsLogin(false)} className="text-primary hover:underline">
                    Sign up
                  </button>
                </p>
                <p className="mt-2">
                  <button 
                    onClick={() => navigate('/forgot-password')} 
                    className="text-primary hover:underline text-sm"
                  >
                    Forgot Password?
                  </button>
                </p>
              </>
            ) : (
              <p>
                Already have an account?{' '}
                <button onClick={() => setIsLogin(true)} className="text-primary hover:underline">
                  Log in
                </button>
              </p>

            )}
            <div className="mt-4 flex items-center justify-center">
              <hr className='w-1/2' />
              <p className="mx-2">OR</p>
              <hr className="w-1/2" />
            </div>

            <GoogleSignIn />

          </div>
        </div>
        {errorMessage && <ErrorDialog message={errorMessage} onClose={() => setErrorMessage('')} />}


        {successMessage && <SuccessDialog message={successMessage} onClose={() => setSuccessMessage('')} />}
      </div>
    </div>
  );
}

export default SignIn;
