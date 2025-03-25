"use client";

import { Button } from "@/components/ui/button";
import ProgressBar from "@/src/components/ProgressBar";
import { useRouter } from "next/navigation";

const SecondOnboarding = () => {
  const router = useRouter();

  return (
    <div className="flex justify-center bg-[url('/test.jpg')] bg-cover w-full h-screen">
      <div className="flex flex-col items-center justify-center w-full space-y-3">
        
        <div className="container mx-auto px-3 pt-2 w-100 rounded-lg mb-5 h-[424px]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <div className="flex items-center justify-center mt-10 ml-10 mr-10">
          <p  className="text-xl font-normal text-center  font-neris"
   style={{textAlign: 'center' }}>
  This tool is designed to help decision makers predict and analyse litter, 
  design and rollout initiatives to beautify communities effectively and efficiently.
</p>


          </div>
          <div className="flex items-center justify-center mt-14">
            <Button
              onClick={() => router.push("/signup")}
              style={{
                border: '2px solid #5BAA76',  // Add green border
                color: '#5BAA76',  // Text color should match border
                backgroundColor: 'transparent', 
             
               
                width: '324px',
                height: '48px',  
               
                fontSize: '16px',
              }}
              className="hover:bg-[#5BAA76] transition-colors duration-300 font-neris text-2xl font-bold "
            >
              Sign Up
            </Button>
          </div>
          <div className="flex items-center justify-center mt-8">
            <Button
              onClick={() => router.push("/login")}
              style={{
                backgroundColor: '#5BAA76',
                color: 'white',
                width: '324px',
                height: '48px',  
              
                fontSize: '16px',
              }}
              className="hover:bg-[#5BAA76] transition-colors duration-300 font-neris text-2xl font-bold "
            >
              Log In
            </Button>
          </div>
        </div>
        <ProgressBar width={60} />
      </div>
    </div>
  );
};

export default SecondOnboarding;
