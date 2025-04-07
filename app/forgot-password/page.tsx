'use client'

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { yupResolver } from '@hookform/resolvers/yup';
import { sendOtp, resetPassword } from '../utils/api';
import { useRouter } from 'next/navigation';

const ForgotPassword = () => {
  const [otpSent, setOtpSent] = useState(false);
  const router = useRouter();

  const schema = Yup.object().shape({
    email: Yup.string()
      .email('Please enter a valid email address.')
      .required('Email is required'),
    otp: otpSent ? Yup.string().required('OTP is required') : Yup.string().notRequired(),
    newPassword: otpSent ? Yup.string().min(6, 'Password must be at least 6 characters').required('New password is required') : Yup.string().notRequired(),
    confirmPassword: otpSent ? Yup.string().oneOf([Yup.ref('newPassword')], 'Passwords must match').required('Confirm password is required') : Yup.string().notRequired(),
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
  });

  const handleForgotPassword = async (data:any) => {
    const payload = {
      email: data?.email
    }
    try {
      const response = await sendOtp(payload);
      if (response) {
        setOtpSent(true);
        toast.success('OTP sent successfully!');
      } else {
        toast.error('Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast.error('Error sending OTP');
    }
  };

  const handleVerifyOtpAndResetPassword = async (data: { email: string; otp: string; newPassword: string }) => {
    try {
      const response = await resetPassword(data);
      if (response) {
        reset();
        router.push('/')
        toast.success('Password reset successful');
      } else {
        toast.error('Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Error resetting password');
    }
  };

  type FormData = { email: string } | { email: string; otp: string; newPassword: string };

  const onSubmit: SubmitHandler<FormData> = (data) => {
    if (otpSent) {
      handleVerifyOtpAndResetPassword(data as { email: string; otp: string; newPassword: string });
    } else {
      handleForgotPassword(data as { email: string });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full sm:w-96">
        <h2 className="text-2xl font-semibold text-center mb-6 text-[#3AAD73] font-neris">Forgot Password</h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 font-neris">Email Address</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              {...register('email')}
              className={`mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md font-neris focus:ring-[#3AAD73] focus:border-[#3AAD73] ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1 font-neris">{errors.email.message}</p>}
          </div>

          {otpSent && (
            <>
              <div className="mb-4">
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 font-neris">OTP</label>
                <input
                  type="text"
                  id="otp"
                  placeholder="Enter OTP"
                  {...register('otp')}
                  inputMode="numeric"  
                  pattern="\d+"        
                  className={`mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md font-neris focus:ring-[#3AAD73] focus:border-[#3AAD73] ${errors.otp ? 'border-red-500' : ''}`}
                />
                {errors.otp && <p className="text-red-500 text-xs mt-1 font-neris">{errors.otp.message}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 font-neris">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  placeholder="Enter new password"
                  {...register('newPassword')}
                  className={`mt-2 block w-full px-4 py-2 border border-gray-300 font-neris rounded-md focus:ring-[#3AAD73] focus:border-[#3AAD73] ${errors.newPassword ? 'border-red-500' : ''}`}
                />
                {errors.newPassword && <p className="text-red-500 text-xs mt-1 font-neris">{errors.newPassword.message}</p>}
              </div>

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium font-neris text-gray-700">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm password"
                  {...register('confirmPassword')}
                  className={`mt-2 block w-full px-4 py-2 border border-gray-300 rounded-md font-neris focus:ring-[#3AAD73] focus:border-[#3AAD73] ${errors.confirmPassword ? 'border-red-500' : ''}`}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-neris">{errors.confirmPassword.message}</p>}
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full font-neris py-2 px-4 bg-[#3AAD73] text-white font-semibold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-[#3AAD73] focus:ring-opacity-50"
          >
            {otpSent ? 'Reset Password' : 'Send OTP'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
