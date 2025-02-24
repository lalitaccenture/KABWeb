"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react"
import { SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import { login } from "../utils/api";
import Image from "next/image";

interface IFormInput {
    email: string;
    password: string;
}
const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email address").required("Email is required"),
    password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
});

const Login = () => {

    const router = useRouter();

    const { register, handleSubmit, formState: { errors }, reset } = useForm<IFormInput>({
        resolver: yupResolver(validationSchema),
    });

    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        // const response = await signIn("credentials", {
        //     redirect: false,
        //     email: data.email,
        //     password: data.password,
        // });

        // if (response?.error) {
        //     toast.error("Invalid credentials!");
        // } else if (response?.ok) {
        //     toast.success("Logged in successfully!");
        //     router.push("/home"); 
        // }
    };

    return (
        <div className="flex justify-center bg-[url('/test.jpg')] bg-cover w-full mb-8 pb-8">
            <div className="container mx-auto px-3 pt-2 w-100 mt-16 rounded-lg flex" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                {/* Left Section (Login Form) */}
                <div className="w-1/2 p-6 space-y-6">
                    <h2 className="text-3xl font-bold text-left font-neris">Log In</h2>

                    <button
                        onClick={() => signIn("google")}
                        className="w-full py-2 px-4 text-black border-2 border-[#5BAA76] rounded-lg flex items-center justify-center space-x-2 hover:bg-[#f1f1f1] focus:outline-none focus:ring-2 focus:ring-[#5BAA76]">
                        <Image src="/google.png" alt="Google" width={20} height={20} />
                        <span className="font-neris">Continue with Google</span>
                    </button>

                    <button
                        onClick={() => signIn("apple")}
                        className="w-full py-2 px-4 text-black border-2 border-[#5BAA76] rounded-lg flex items-center justify-center space-x-2 hover:bg-[#f1f1f1] focus:outline-none focus:ring-2 focus:ring-[#5BAA76]">
                        <Image src="/logo-apple.png" alt="Apple" width={20} height={20} />
                        <span className="font-neris">Continue with Apple</span>
                    </button>



                    {/* <button
                        onClick={() => signIn("facebook")}
                        className="w-full py-2 px-4 text-black border-2 border-[#5BAA76] rounded-lg flex items-center justify-center space-x-2 hover:bg-[#f1f1f1] focus:outline-none focus:ring-2 focus:ring-[#5BAA76]">
                        <img src="/fb.png" alt="Facebook" className="h-5" />
                        <span>Continue with Facebook</span>
                    </button> */}


                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">


                        <div>
                            <label htmlFor="email" className="block text-sm font-medium font-neris">Email</label>
                            <input
                                type="email"
                                {...register("email")}
                                className={`w-full px-4 py-2 border rounded-md font-neris ${errors.email ? "border-red-500" : "border-gray-300"}`}
                            />
                            {errors.email && <p className="text-sm text-red-500 font-neris">{errors.email.message}</p>}
                        </div>


                        <div>
                            <label htmlFor="email" className="block text-sm font-medium font-neris">Password</label>
                            <input
                                type="password"
                                {...register("password")}
                                className={`w-full px-4 py-2 border rounded-md font-neris ${errors.password ? "border-red-500" : "border-gray-300"}`}
                            />
                            {errors.password && <p className="text-sm text-red-500 font-neris">{errors.password.message}</p>}
                        </div>
                        <div className="flex items-center justify-center mt-14">

                            <Button type="submit"
                                className="w-full py-3 hover:bg-[#5BAA76]-600 transition font-neris"
                                style={{
                                    backgroundColor: '#3AAD73',
                                    color: 'white',
                                    width: '324px',
                                    height: '48px',
                                    borderRadius: '32px',
                                    fontSize: '16px',
                                }}>
                                Login
                            </Button>
                        </div>
                    </form>


                    {/* <p className="text-center text-sm underline cursor-pointer">
                        Use Single Sign-On
                    </p> */}


                    <p className="text-center text-sm underline cursor-pointer mt-5 font-neris" onClick={() => router.push('/forgot-password')}>
                        Forgot password?
                    </p>
                </div>


                {/* <div className="w-1/2 p-6 flex flex-col justify-center items-start space-y-4" style={{ backgroundImage: 'url("/login.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}> */}
                <div className="flex w-full lg:w-1/2 px-6 py-8 mt-6 lg:mt-0 justify-center items-center">
                    <Image
                        src="/login.jpg"
                        alt="Signup Illustration"
                        width={360}
                        height={563}
                        className="w-full h-auto rounded-lg"
                    />
                    {/* </div> */}

                    {/* <div className="bg-white bg-opacity-70 p-6 rounded-lg shadow-lg space-y-4">

                <h3 className="text-2xl font-semibold font-neris">Welcome back!</h3>
                    <p className="text-lg font-neris">Log in to predict and analyse litter.</p>
                    <p className="text-lg font-neris">Let's keep our community clean together.</p>
                </div> */}
                </div>
            </div>

        </div>

    )
}

export default Login