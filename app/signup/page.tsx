"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import { signIn } from "next-auth/react"
import { signUp } from "../utils/api";
interface IFormInput {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const validationSchema = Yup.object().shape({
    username: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email address").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Confirm password is required"),
});

const SignUp = () => {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("signup"); // Default to "Sign Up"
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<IFormInput>({
        resolver: yupResolver(validationSchema),
    });

    // const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    //     if (loading) return;
    //     try {
    //         setLoading(true);

    //         signUp

    //         // Mock API request (Replace with actual API call)
    //         await new Promise((resolve) => setTimeout(resolve, 1500));

    //         toast.success("Sign-up successful! Please verify your account before logging in");
    //         reset();
    //         router.push("/"); // Redirect to Sign In
    //     } catch (error) {
    //         console.error("Signup error", error);
    //         toast.error("An error occurred!");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    const onSubmit: SubmitHandler<IFormInput> = async (data: { email: string; username: string; password: string }) => {

        if (!data.email.toLowerCase().endsWith('@kab.org')) {
            toast.error('Sign-up successful! Manual verification needed. Contact admin/KAB ops for access.');
            return;
        }
    
        try {
            const response = await signUp(data);
            //response.success
            if (response) {
                toast.success('Sign-up successful! Please verify your account before logging in');
                reset();
                router.push("/"); 
            } else {
                toast.error('Failed to sign up');
            }
        } catch (error) {
            console.error('Error signing up', error);
            toast.error('Error signing up');
        }
    };


    return (
        <div className="flex min-h-screen overflow-y-auto">
            {/* ✅ Left Side: Enlarged Image Section */}
            <div className="hidden lg:flex w-1/2 overflow-hidden">
                <div className="relative w-full min-h-screen">
                    <Image
                        src="/login.jpg"
                        alt="LitterSense Cleanup"
                        layout="fill"
                        objectFit="cover"
                        priority
                    />
                </div>
            </div>
            <div className="w-full lg:w-1/2 flex flex-col ">
                {/* ✅ Right Side: Sign-Up Form */}
                <div className="w-full flex flex-col justify-center items-center px-8 lg:px-20 py-10" style={{marginTop:'1%'}}>
                    <div className="w-full flex justify-end " style={{ marginTop: '-10%' ,marginLeft:'28%' }}>
                        <div className="text-right">
                            <p className="text-[#5BAA76] text-xl font-bold">LitterSense</p>
                            <Image src="/powered.png" alt="Accenture" width={100} height={14} className="object-contain mt-[-4px]" />
                        </div>
                    </div>

                    <div className="text-center mb-6">
                        <p className="text-xl font-semibold text-black">Welcome to LitterSense</p>
                        <p className="text-xs text-gray-600">The world's first litter prediction tool!</p>
                    </div>
                    {/* ✅ Toggle Button */}
                    <div className="flex bg-gray-200 p-1 rounded-full w-full max-w-sm mb-6">
                        <button
                            className={`w-1/2 py-2 text-center rounded-full transition-all ${activeTab === "signin" ? "bg-white shadow font-semibold" : "text-gray-500"
                                }`}
                            onClick={() => {
                                setActiveTab("signin");
                                router.push("/");
                            }}
                        >
                            Sign In
                        </button>
                        <button
                            className={`w-1/2 py-2 text-center rounded-full transition-all ${activeTab === "signup" ? "bg-white shadow font-semibold" : "text-gray-500"
                                }`}
                            onClick={() => setActiveTab("signup")}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* ✅ Sign-Up Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-3">
                        <div>
                            <label className="block text-sm font-medium">Name</label>
                            <input
                                type="text"
                                {...register("username")}
                                className="w-full px-4 py-2 border rounded-md focus:border-[#5BAA76] focus:outline-none"
                            />
                            {errors.username && <p className="text-sm text-red-500">{errors.username.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Email</label>
                            <input
                                type="email"
                                {...register("email")}
                                className="w-full px-4 py-2 border rounded-md focus:border-[#5BAA76] focus:outline-none"
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Password</label>
                            <input
                                type="password"
                                {...register("password")}
                                className="w-full px-4 py-2 border rounded-md focus:border-[#5BAA76] focus:outline-none"
                            />
                            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium">Confirm Password</label>
                            <input
                                type="password"
                                {...register("confirmPassword")}
                                className="w-full px-4 py-2 border rounded-md focus:border-[#5BAA76] focus:outline-none"
                            />
                            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
                        </div>

                        {/* ✅ Submit Button */}
                        <button
                            type="submit"
                            className="w-full py-3 font-semibold bg-[#5BAA76] text-white rounded-md hover:bg-[#4A9A65] transition"
                            disabled={loading}
                        >
                            {loading ? "Signing Up..." : "Sign Up"}
                        </button>
                    </form><br/>
{/* 
                    <div className="flex space-x-4">
                        <button onClick={() => signIn("google")} className="w-10 h-10">
                            <Image src="/google.png" alt="Google" width={20} height={20} />
                        </button>
                        <button onClick={() => signIn("apple")} className="w-10 h-10">
                            <Image src="/logo-apple.png" alt="Apple" width={24} height={24} />
                        </button>
                    </div> */}
                    <div >
                    <a href="https://www.kab.org" target="_blank" rel="noopener noreferrer">
                        <Image
                            src="/kab.png"
                            alt="Keep America Beautiful"
                            width={178}
                            height={28}
                            className="object-contain"
                        />
                        </a>
                    </div>
          



                </div>
                    {/*  Footer Section */}
                <div className="flex justify-between items-center w-full px-8 mt-1 text-xs text-gray-600" style={{ marginTop: '5' }}>
                    <p>© 2025 Keep America Beautiful</p>
                    <div className="flex space-x-3">
                        <a href="https://www.facebook.com/KeepAmericaBeautiful" target="_blank" rel="noopener noreferrer">
                            <Image src="/facebook.png" alt="Facebook" width={18} height={18} />
                        </a>
                        <a href="https://www.instagram.com/keepamericabeautiful/" target="_blank" rel="noopener noreferrer">
                            <Image src="/insta.png" alt="Instagram" width={18} height={18} />
                        </a>
                        <a href="https://x.com/kabtweet?mx=2" target="_blank" rel="noopener noreferrer">
                            <Image src="/twitter.png" alt="Twitter" width={18} height={18} />
                        </a>
                        <a href="https://www.youtube.com/channel/UCwXz-YHuMvTixJAC-Vr9EIg" target="_blank" rel="noopener noreferrer">
                            <Image src="/yt.png" alt="YouTube" width={18} height={18} />
                        </a>
                        <a href="https://www.linkedin.com/company/keepamericabeautiful" target="_blank" rel="noopener noreferrer">
                            <Image src="/linkedin.png" alt="LinkedIn" width={18} height={18} />
                        </a>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default SignUp;
