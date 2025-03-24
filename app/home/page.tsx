"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

const Home = () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/"); // Redirect to login page
        }
    }, [status, router]);

    if (status === "loading") {
        return <p>Loading...</p>; // Prevents UI flickering
    }

    return (
        <div className="flex flex-col justify-center bg-[url('/test.jpg')] bg-cover w-full h-auto mb-4 pb-4">
            <div className="container mx-auto px-3 pt-2 w-full mt-16 rounded-lg pb-2" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                <div className="text-center mt-2 pt-1">
                    <p className="text-2xl font-semibold font-neris">Beautify Communities with Litter Data</p>
                    <p className="mt-1 text-md font-neris">Predict and analyze local litter trends to keep neighborhoods clean and green. Just select your state, county, or census tract — and get started!</p>
                </div>

                <div className="flex mt-6 mx-4 gap-8">
                    {/* Left Section (Prediction) */}
                    <div className="w-1/2">
                        <div className="space-y-4">
                            <Button
                                className="w-full px-6 py-6 bg-[#3AAD73] text-white rounded-lg hover:bg-[#3AAD73] transition duration-200 text-2xl"
                                onClick={() => router.push('/prediction')}
                            >
                                <span className="font-neris">Prediction</span>
                            </Button>

                            {/* White Background Div with <p> and Image */}
                            <div className="mt-4 p-4 bg-white rounded-lg">
                                <p className="text-md text-gray-700 font-neris italic">
                                Generate weekly litter maps and visualize hotspots, bins, and amenities in real time, allowing for better planning of litter reduction measures
                                </p>
                                <div className="relative mx-14 mt-2" >
                                    <Image
                                        src='/predic.png' 
                                        alt="Prediction Image"
                                        width={500} 
                                        height={150} 
                                        layout="intrinsic" 
                                        className="rounded-lg" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section (Analysis) */}
                    <div className="w-1/2">
                        <div className="space-y-4">
                            <Button
                                className="w-full px-6 py-6 bg-[#3AAD73] text-white rounded-lg hover:bg-[#3AAD73] transition duration-200 text-2xl"
                                onClick={() => router.push('/analysis-external')}
                            >
                                <span className="font-neris">Analysis</span>
                            </Button>

                            {/* White Background Div with <p> and Image */}
                            <div className="mt-4 p-4 bg-white rounded-lg">
                                <p className="text-md text-gray-700 font-neris italic">
                                Explore detailed trends, stats, and historical patterns to understand how litter at your region changes over time
                                </p>
                                <div className="relative mx-14 mt-2">
                                    <Image
                                        src='/analys.png' 
                                        alt="Analysis Image"
                                        width={500} 
                                        height={150} 
                                        layout="intrinsic" 
                                        className="rounded-lg" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
