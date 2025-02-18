'use client';

import dynamic from "next/dynamic";

const AnalysisMap = dynamic(() => import("../../src/components/AnalysisMap"), { ssr: false });

const Analysis = () => {
  return (
    
    <div className="flex w-full h-screen">
       
      <div className="w-1/5 p-4">
       
        Left Section
      </div>

      {/* Center section with the AnalysisMap component */}
      <div className="w-3/5 p-4 flex justify-center items-center">
      <AnalysisMap />
      </div>

      
      <div className="w-1/5 p-4">
       
        Right Section
      </div>
    </div>
  );
}

export default Analysis;
