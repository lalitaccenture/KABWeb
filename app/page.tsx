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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingLogin, setPendingLogin] = useState<IFormInput | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);

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
        router.push("/analysis-external"); // Redirect if session exists
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
    setPendingLogin(data);
    setShowTermsModal(true);
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
          <div className="w-full flex justify-end " style={{ marginLeft: '21%' }}>
            <div className="text-right">
              <p className="text-[#5BAA76] text-xl font-bold">LitterSense</p>
              <Image src="/powered.png" alt="Accenture" width={100} height={14} className="object-contain mt-[-4px]" />
            </div>
          </div>

          {/* ✅ Welcome Text */}
          <div className="text-center mb-6" style={{marginTop:'10%'}}>
            <p className="text-xl font-semibold text-black">Welcome to LitterSense</p>
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
              className={`w-full py-3 font-semibold text-white rounded-md transition
                ${loadingLoginBtn ? 'bg-[#A0A0A0] cursor-not-allowed' : 'bg-[#5BAA76] hover:bg-[#4A9A65]'}`}
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
        {/*   <div className="my-3 flex items-center w-full max-w-sm">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-2 text-xs text-gray-400">Or Continue With</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div> */}

          {/* ✅ Social Login Buttons */}
       {/*    <div className="flex" style={{marginLeft:'6%' ,marginTop:'-2%'}}>
            <button onClick={() => signIn("google")} className="w-10 h-10">
              <Image src="/google.png" alt="Google" width={20} height={20} />
            </button>
            <button onClick={() => signIn("apple")} className="w-10 h-10" style={{marginLeft:'-10%'}}>
              <Image src="/logo-apple.png" alt="Apple" width={24} height={24} />
            </button>
          </div>
 */}
          {/* ✅ Keep America Beautiful Logo */}
          <div style={{marginTop:'15px'}}>
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



      {/* 📌 Custom Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-2xl w-[90%] max-w-4xl max-h-screen p-8 overflow-y-auto flex flex-col">

            <h2 className="text-2xl font-bold mb-4 font-neris text-center">
              Disclaimer Acknowledgement
            </h2>
            <div className="space-y-6 text-sm text-gray-700 font-neris">
              {/* Intro */}
              <p className="text-base text-gray-800">
                <strong>Note:</strong> While we strive to provide accurate and meaningful insights, please consider the following disclaimers when interpreting and utilizing the data:
              </p>
              {/* Data Sources */}
              <div className="flex items-start gap-3">
                <span className="text-xl mt-1" style={{ color: '#5BAA76' }}>📊</span>
                <div>
                  <h4 className="font-semibold text-base text-[#5BAA76]">Data Sources & Timeframe</h4>
                  <p>
                  Insights & predictions are based on external data collected between 2015 and 2024, including weather (Open-Meteo), amenities (OpenStreetMap), demographics (US Census), Litter data (Open source data), and survey data (KAB 2020). Completeness may vary depending on source accuracy and availability.
                  </p>
                </div>
              </div>

              {/* Scope & Limitations */}
              <div className="flex items-start gap-3">
                <span className="text-xl mt-1" style={{ color: '#5BAA76' }}>📍</span>
                <div>
                  <h4 className="font-semibold text-base text-[#5BAA76]">Scope & Limitations</h4>
                  <p>
                  This tool provides directional insights and may not fully reflect all littering patterns or cleanup programs. Data quality depends on third-party sources.
                  </p>
                </div>
              </div>

              {/* Litter Quantity Measurement */}
              <div className="flex items-start gap-3">
                <span className="text-xl mt-1" style={{ color: '#5BAA76' }}>♻️</span>
                <div>
                  <h4 className="font-semibold text-base text-[#5BAA76]">Litter Quantity Measurement</h4>
                  <p>
                  Litter quantity is measured as a count of individual litter items, regardless of their size or volume, categorized by type.
                  </p>
                </div>
              </div>

              {/* Evolving Nature */}
              <div className="flex items-start gap-3">
                <span className="text-xl mt-1" style={{ color: '#5BAA76' }}>🔄</span>
                <div>
                  <h4 className="font-semibold text-base text-[#5BAA76]">Evolving Insights</h4>
                  <p>
                  As new data is integrated, results may evolve. Current insights are provisional and subject to change over time.
                  </p>
                </div>
              </div>

              {/* Liability */}
              <div className="flex items-start gap-3">
                <span className="text-xl mt-1" style={{ color: '#5BAA76' }}>⚠️</span>
                <div>
                  <h4 className="font-semibold text-base text-[#5BAA76]">Liability Disclaimer</h4>
                  <p>
                  This tool is intended as an analytical aid. Conclusions drawn from this data should be viewed as indicative. We disclaim liability for actions based on these insights.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={async () => {
                  if (!pendingLogin) return;
                  try{
                  setLoadingLoginBtn(true)
                  setIsSubmitting(true);
                  setShowTermsModal(false);

                  const response = await signIn("credentials", {
                    redirect: false,
                    email: pendingLogin.email,
                    password: pendingLogin.password,
                  });

                  setIsSubmitting(false);
                  setPendingLogin(null);

                  if (response?.error) {
                    toast.error("Invalid credentials!");
                  } else if (response?.ok) {
                    toast.success("Logged in successfully!");
                    reset();
                    router.push("/analysis-external?from=login");
                  }}
                  catch (error) {
                    console.error("Login error", error);
                    toast.error("An error occurred!");
                  } finally {
                    setLoadingLoginBtn(false); // Re-enable button after request completes
                  }
                }}
                className="px-5 py-2 rounded-md bg-[#5BAA76] text-white hover:bg-green-600 font-neris"
              >
                I Accept
              </button>
              <button
                onClick={() => {
                  setShowTermsModal(false);
                  setPendingLogin(null);
                  toast.info("You must accept the terms to proceed.");
                }}
                className="px-5 py-2 rounded-md bg-red-500 text-white hover:bg-red-700 font-neris"
              >
                I Deny
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

  );



}

export default Login