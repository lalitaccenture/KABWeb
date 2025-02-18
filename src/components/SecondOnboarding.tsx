"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const SecondOnboarding = () => {
  const router = useRouter();
  return (
    <>
      <div className="flex items-center justify-center mt-10 ml-10 mr-10">
        <p className="text-2xl font-normal font-sans items-center justify-center" style={{ fontFamily: 'Open Sans' }}>
  This tool is designed to help decision makers by predicting litter, <br />
  helping analyse and compare regions based on their litter profile <br />
  and create scenarios to see the predicted impact of planned <br />
  interventions to help develop initiatives and policies.
</p>
      </div>
      <div className="flex items-center justify-center mt-10">
        <Button
          onClick={() => router.push("/signup")}
          style={{
            backgroundColor: '#5BAA76',
            color: 'white',
            width: '424px',
            borderRadius: '32px',
          }}
          className="hover:bg-green-600 transition-colors duration-300"
        >
          Sign Up
        </Button>
      </div>
      <div className="flex items-center justify-center mt-10">
        <Button
          onClick={() => router.push("/login")}
          style={{
            backgroundColor: '#5BAA76',
            color: 'white',
            width: '424px',
            borderRadius: '32px',
          }}
          className="hover:bg-green-600 transition-colors duration-300"
        >
          Log In
        </Button>
      </div>
    </>
  )
}

export default SecondOnboarding;