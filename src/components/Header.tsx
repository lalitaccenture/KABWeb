'use client';

import Image from "next/image"
import Link from "next/link"
import UserIcon from "./UserIcon";
import { usePathname, useRouter } from "next/navigation";
import { useState,useEffect } from "react";


const Header = () => {

    const router = useRouter();
    const pathname = usePathname();
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [activeTab, setActiveTab] = useState(pathname);

    const handleAnalysisClick = (e: React.MouseEvent) => {
     /*    e.preventDefault();
        setIsDropdownVisible((prev) => !prev);
        setActiveTab('/analysis'); */
        router.push('/analysis-external')
      };

      useEffect(() => {
        // Close dropdown when navigating away from /analysis or its children
        if (!pathname.startsWith('/analysis')) {
            setIsDropdownVisible(false);
        }

        // Keep Analysis tab active when visiting dropdown links
        if (pathname.startsWith('/analysis')) {
            setActiveTab('/analysis');
        } else {
            setActiveTab(pathname);
        }
    }, [pathname]);



    return (
        <div className="w-full flex h-12 ">
            <div className="w-1/3 p-1 ml-4">
                <p className="text-[#5BAA76] text-base font-bold cursor-pointer font-neris" onClick={()=>router.push('/')}>LitterSense</p>
                <div className="flex">
        <Image
            src="/powered.png"
            alt="Accenture"
            width={100}
            height={14}
            className="object-contain"
        />
    </div>
            </div>
            <div className="w-1/3 p-2 flex items-center">
                <nav className="w-full">
                    <ul className="flex justify-start gap-12 w-full">
                        <li>
                        <Link href="/home" onClick={() => setActiveTab('/home')}>
    <span className={`text-gray-500 font-neris hover:text-white focus:text-white 
    hover:bg-[#3AAD73] focus:bg-[#3AAD73] hover:border-[#3AAD73] focus:border-b-2 
    focus:border-[#3AAD73] px-2 py-1 rounded-md ${activeTab === '/home' ? 'bg-[#3AAD73] text-white' : ''}`}>
        Home
    </span>
</Link>

</li>
<li>
<Link href="/prediction" onClick={() => setActiveTab('/prediction')}>
    <span className={`text-gray-500 font-neris hover:text-white focus:text-white 
    hover:bg-[#3AAD73] focus:bg-[#3AAD73] hover:border-[#3AAD73] focus:border-b-2 
    focus:border-[#3AAD73] px-2 py-1 rounded-md ${activeTab === '/prediction' ? 'bg-[#3AAD73] text-white' : ''}`}>
        Prediction
    </span>
</Link>

</li>
{/* <li>
    <Link href="/analysis" className="text-gray-500 hover:text-black focus:text-black hover:border-b-2 hover:border-[#3AAD73] focus:border-b-2 focus:border-[#3AAD73]">
    <span
            className={`text-gray-500 font-neris hover:text-white focus:text-white hover:bg-[#3AAD73] focus:bg-[#3AAD73] hover:border-[#3AAD73] focus:border-b-2 focus:border-[#3AAD73] px-2 py-1 rounded-md ${pathname === '/analysis' ? 'bg-[#3AAD73] text-white' : ''}`}

        >
        Analysis
        </span>
    </Link>
</li> */}
<li
      className="relative"
     
    >
      {/* Main Link for Analysis */}
      <button  onClick={handleAnalysisClick}>
    <span className={`text-gray-500 font-neris hover:text-white focus:text-white 
    hover:bg-[#3AAD73] focus:bg-[#3AAD73] hover:border-[#3AAD73] focus:border-b-2 
    focus:border-[#3AAD73] px-2 py-1 rounded-md ${activeTab === '/analysis' ? 'bg-[#3AAD73] text-white' : ''}`}>
        Analysis
    </span>
</button>


      {/* Dropdown Menu */}
      {isDropdownVisible && (
        <div className="absolute left-0 top-full mt-1 bg-white shadow-lg rounded-md border w-48 h-30 z-[555]">
       
          <Link
            href="/analysis-external"
            className="block px-4 py-2 text-gray-700 hover:bg-[#3AAD73] hover:text-white"
            onClick={()  =>{  setIsDropdownVisible(false)}} 
          >
            Analysis - External
          </Link>
          <Link
            href="/analysis-kab"
            className="block px-4 py-2 text-gray-700 hover:bg-[#3AAD73] hover:text-white"
            onClick={() => {setIsDropdownVisible(false)}}

          >
            Analysis - KAB
          </Link>
        </div>
      )}
    </li>
                        {/* <li>
                            <Link href="/scenario-modeling" className="text-gray-500 hover:text-black focus:text-black">
                                Scenario Modeling
                            </Link>
                        </li> */}
                    </ul>
                </nav>
            </div>
            <div className="flex-grow p-2 flex items-center">
    <div className="flex justify-center" style={{ width: '40%' }}>
        <Image
            src="/kab.png"
            alt="Logo KAB"
            width={178}
            height={28}
            className="object-contain"
        />
    </div>
    
    <div className="flex justify-center gap-6 cursor-pointer" onClick={()=>router.push('/user-profile')} style={{ width: '60%', marginLeft: '70px' }}>
    <Image
            src="/notif.png"
            alt="Notification"
            width={20}
            height={10}
            className="object-contain"
        />
        <UserIcon src="/usertest.png" username="User"/>
    </div>
</div>

        </div>
    )
}


export default Header