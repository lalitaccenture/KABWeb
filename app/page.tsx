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
  <p className="text-2xl font-semibold font-neris">Welcome to the Litter Mapping Tool!</p>
</div>

<div className="flex  items-center justify-center mt-10 ml-14 mr-14">
  <p className="text-xl font-normal text-center  font-neris">
    We're so excited to have you join a movement dedicated to smarter, data-driven litter management!
    <br />
    Predict. Plan. Prevent.
  </p>
</div>

          <div className="flex items-center justify-center mt-16">
          <Button
  style={{
 
   
    width: '324px',
    height: '48px',  
    border: '2px solid #5BAA76',  
    color: '#5BAA76',  
    backgroundColor: 'transparent', 
    fontSize: '16px',
  }}
  className="hover:bg-[#5BAA76] transition-colors duration-300 font-neris font-semibold"
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
