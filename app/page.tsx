"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/src/components/ProgressBar";

export default function Home() {
  const router = useRouter();

  const handleExploreClick = () => {
    router.push("/second-onboarding");
  };

  return (
    <div className="flex justify-center bg-[url('/test.jpg')] bg-cover w-full h-screen">
      <div className="flex flex-col items-center justify-center w-full space-y-3">
        
        <div className="container mx-auto px-3 pt-2 w-100 rounded-lg mb-5 h-[424px]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
        <div className="flex items-center justify-center mt-14">
  <h1 className="text-3xl font-normal font-neris">Welcome to the Litter Mapping Tool!</h1>
</div>

          <div className="flex flex-col items-center justify-center mt-10 ml-14 mr-14">
          <p className="text-3xl font-normal text-center mb-2 font-neris">
          We're so excited to have you join a movement dedicated to smarter, data-driven litter management!
          Predict. Plan. Prevent.
</p>

          </div>
          <div className="flex items-center justify-center mt-16">
          <Button
  style={{
    backgroundColor: '#3AAD73',
    color: 'white',
    width: '324px',
    height: '48px',  
    borderRadius: '32px',
    fontSize: '16px',
  }}
  className="hover:bg-[#3AAD73] transition-colors duration-300 font-neris"
  onClick={handleExploreClick} 
>
  Let's explore
</Button>
          </div>
        </div>

        <ProgressBar width={30} />
      </div>
    </div> 
  );
}
