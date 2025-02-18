"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button } from "@/components/ui/button";
import { SubmitHandler, useForm } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { signUp } from "../utils/api";
import { toast } from 'react-toastify';
import ProgressBar from "@/src/components/ProgressBar";

interface IFormInput {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const schema = yup.object({
    name: yup.string().required("Name is required"),
    email: yup
        .string()
        .email("Invalid email address")
        .required("Email is required"),
    password: yup
        .string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required("Confirm password is required"),
}).required();



const SignUp = () => {

    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit: SubmitHandler<IFormInput> = async (data: { email: string; name: string; password: string }) => {

        try {
            const response = await signUp(data);
            //response.success
            if (response) {
                toast.success('Signed Up!');
                reset();
            } else {
                toast.error('Failed to sign up');
            }
        } catch (error) {
            console.error('Error signing up', error);
            toast.error('Error signing up');
        }
    };
    return (
        <div className="flex flex-col justify-center bg-[url('/test.jpg')] bg-cover w-full h-auto mb-8 pb-8">
        <div className="container mx-auto px-3 pt-2 w-100 mt-16 rounded-lg flex flex-col lg:flex-row" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
            {/* Left Section */}
            <div className="flex flex-col w-full lg:w-1/2 px-6 py-8">
                <h2 className="text-2xl font-semibold mb-6 font-neris">Sign Up</h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
    
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium font-neris">Name</label>
                        <input
                            id="name"
                            type="text"
                            {...register("name")}
                            className="w-full mt-2 p-3 border border-gray-300 rounded-md font-neris"
                            
                        />
                        {errors.name && <p className="text-red-500 text-sm font-neris">{errors.name.message}</p>}
                    </div>
    
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium font-neris">Email</label>
                        <input
                            id="email"
                            type="email"
                            {...register("email")}
                            className="w-full mt-2 p-3 border border-gray-300 rounded-md font-neris"
                        />
                        {errors.email && <p className="text-red-500 text-sm font-neris">{errors.email.message}</p>}
                    </div>
    
                    <div className="mb-6">
                        <label htmlFor="password" className="block text-sm font-medium font-neris">Password</label>
                        <input
                            id="password"
                            type="password"
                            {...register("password")}
                            className="w-full mt-2 p-3 border border-gray-300 rounded-md font-neris"
                        />
                        {errors.password && <p className="text-red-500 text-sm font-neris">{errors.password.message}</p>}
                    </div>
    
                    <div className="mb-6">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium font-neris">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            {...register("confirmPassword")}
                            className="w-full mt-2 p-3 border border-gray-300 rounded-md font-neris"
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-sm font-neris">{errors.confirmPassword.message}</p>}
                    </div>
                    <div className="flex items-center justify-center mt-14">
                    <Button type="submit" onClick={handleSubmit(onSubmit)} 
                    className="w-full py-3 hover:bg-[#5BAA76]-600 transition font-neris"
                    style={{
                        backgroundColor: '#3AAD73',
                        color: 'white',
                        width: '324px',
                        height: '48px',  
                        borderRadius: '32px',
                        fontSize: '16px',
                      }}
                    >
                        Sign Up
                    </Button>
                    </div>
                </form>
    
                <p className="flex mt-4 text-sm font-neris justify-center items-center">
                    Already have an account?
                    <Link href="/login" className="text-black-700 hover:underline ml-1 font-semibold font-neris">
                        Log in
                    </Link>
                </p>
            </div>
    
            {/* Right Section */}
            <div className="w-full lg:w-1/2 px-6 py-8 mt-6 lg:mt-0">
                <Image
                    src="/signup.png"
                    alt="Signup Illustration"
                    width={360}
                    height={543}
                    className="w-full h-auto rounded-lg"
                />
            </div>
        </div>
        
        <div className="w-full max-w-[1024px] mx-auto mt-8 px-6">
            <ProgressBar width={100}/>
        </div>
    </div>
    
    )
}

export default SignUp