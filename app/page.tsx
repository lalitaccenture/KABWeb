"use client";

import { Button } from "@/components/ui/button";
import { getSession, signIn } from "next-auth/react"
import { SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/navigation";
import { toast } from 'react-toastify';
import Image from "next/image";
import { useEffect, useState } from "react";
import Footer from '../src/components/Footer';

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


  //new
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("signin");

  // Track session loading state
  const [loadingLoginBtn, setLoadingLoginBtn] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<IFormInput>({
    resolver: yupResolver(validationSchema),
  });

  // Check if the user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.push("/"); // Redirect if session exists
      } else {
        setLoading(false); // Stop loading once session check is done
      }
    };
    checkSession();
  }, [router]);

  // const onSubmit: SubmitHandler<IFormInput> = async (data) => {
  //     const response = await signIn("credentials", {
  //         redirect: false,
  //         email: data.email,
  //         password: data.password,
  //     });

  //     if (response?.error) {
  //         toast.error("Invalid credentials!");
  //     } else if (response?.ok) {
  //         toast.success("Logged in successfully!");
  //         router.push("/home"); 
  //     }
  // };

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    try {
      setLoadingLoginBtn(true); // Disable button
      const response = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (response?.error) {
        toast.error("Invalid credentials!");
      } else if (response?.ok) {
        toast.success("Logged in successfully!");
        router.push("/home");
      }
    } catch (error) {
      console.error("Login error", error);
      toast.error("An error occurred!");
    } finally {
      setLoadingLoginBtn(false); // Re-enable button after request completes
    }
  };

  //For loading
  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex min-h-screen">
         {/* ✅ Left Side: Full-Height, Scrollable Image */}
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
      <div className="w-full lg:w-1/2 flex flex-col justify-between items-center ">

        {/* ✅ Right Side: Login Form */}
        <div className="w-full  flex flex-col justify-center items-center px-8 lg:px-20">

          {/* ✅ Logo Top Right */}
          <div className="w-full flex justify-end " style={{marginLeft:'21%'}}>
            <div className="text-right">
              <p className="text-[#5BAA76] text-xl font-bold">LitterSense</p>
              <Image src="/powered.png" alt="Accenture" width={100} height={14} className="object-contain mt-[-4px]" />
            </div>
          </div>

          {/* ✅ Welcome Text */}
          <div className="text-center mb-6">
            <p className="text-xl font-semibold text-black">Welcome to Litter Sense</p>
            <p className="text-xs text-gray-600">The world's first litter prediction tool!</p>
          </div>

          {/* ✅ Toggle Buttons */}
          <div className="flex bg-gray-200 p-1 rounded-full w-full max-w-sm mb-4">
            <button
              className={`w-1/2 py-2 text-center rounded-full transition-all ${activeTab === "signin" ? "bg-white shadow font-semibold" : "text-gray-500"}`}
              onClick={() => setActiveTab("signin")}
            >
              Sign In
            </button>
            <button
              className={`w-1/2 py-2 text-center rounded-full transition-all ${activeTab === "signup" ? "bg-white shadow font-semibold" : "text-gray-500"}`}
              onClick={() => { router.push('/signup'); setActiveTab("signup"); }}
            >
              Sign Up
            </button>
          </div>

          {/* ✅ Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm space-y-3">
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

            {/* ✅ Submit Button */}
            <button
              type="submit"
              className="w-full py-3 font-semibold bg-[#5BAA76] text-white rounded-md hover:bg-[#4A9A65] transition"
              disabled={loadingLoginBtn}
            >
              {loadingLoginBtn ? 'Logging In...' : 'Log In'}
            </button>
          </form>

          {/* Forgot Password */}
          <p className="text-xs text-[#5BAA76] cursor-pointer text-right w-full max-w-sm mt-2"
            onClick={() => router.push('/forgot-password')}>
            Forgot password?
          </p>

          {/* ✅ Social Login Section */}
          <div className="my-3 flex items-center w-full max-w-sm">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-2 text-xs text-gray-400">Or Continue With</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* ✅ Social Login Buttons */}
          <div className="flex space-x-4">
            <button onClick={() => signIn("google")} className="w-10 h-10">
              <Image src="/google.png" alt="Google" width={20} height={20} />
            </button>
            <button onClick={() => signIn("apple")} className="w-10 h-10">
              <Image src="/logo-apple.png" alt="Apple" width={24} height={24} />
            </button>
          </div>

          {/* ✅ Keep America Beautiful Logo */}
          <div>
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
        {/* ✅ Footer Section */}
        <div className="flex justify-between w-full  mt-1 text-xs text-gray-600 px-8 lg:px-30" >
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



}

export default Login