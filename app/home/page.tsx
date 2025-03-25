"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

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
                <div className="text-center mt-4 pt-4">
                    <p className="text-medium font-semibold font-neris">Want to see how Litter Data can help beautify communities?</p>
                    <p className="mt-1 text-medium font-semibold font-neris">Choose your need below to see the impact!</p>
                </div>

                <div className="flex mt-8 mx-4 gap-8">
                    {/* Left Section (Prediction) */}
                    <div className="w-1/2">
                        <div className="space-y-4">
                            <Button
                                className="w-full px-6 py-6 bg-[#5BAA76] text-white rounded-lg hover:bg-[#5BAA76] transition duration-200 text-xl font-neris font-semibold"
                                onClick={() => router.push('/prediction')}
                            >
                                <span className="font-neris">Prediction</span>
                            </Button>

                            {/* White Background Div with <p> and Image */}
                            <div className="mt-4 p-4 bg-white rounded-lg">
                                <p className="text-base font-medium font-neris ">
                                Choose the state, county or census tract you are interested in, and our advanced tool will generate predicted litter maps for the week of your selection. This feature  allows you to visualise and analyse litter distribution along with bins, amenities etc of the selected region.
                                </p>
                                <div className="relative mt-4">
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
                                  className="w-full px-6 py-6 bg-[#5BAA76] text-white rounded-lg hover:bg-[#5BAA76] transition duration-200 text-xl font-neris font-semibold"
                                onClick={() => router.push('/analysis-external')}
                            >
                                <span className="font-neris">Analysis</span>
                            </Button>

                            {/* White Background Div with <p> and Image */}
                            <div className="mt-4 p-4 bg-white rounded-lg">
                                <p className="text-base font-medium font-neris">
                                Wish to see litter trends and analysis of a region? Select your state, county or census tract and get a comprehensive view of trends, statistics and historical litter patterns for your selected region!
                                </p>
                                <div className="relative mt-4">
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
