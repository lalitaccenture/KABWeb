'use client';

import Image from "next/image"
import Link from "next/link"
import UserIcon from "./UserIcon";
import { usePathname, useRouter } from "next/navigation";


const Header = () => {

    const router = useRouter();
    const pathname = usePathname();
    // ${pathname === '/home' ? 'border-b-2 border-[#3AAD73]' : ''} 
    return (
        <div className="w-full flex">
            <div className="w-1/3 p-2">
                <h2 className="text-[#5BAA76] text-2xl font-semibold cursor-pointer font-neris" onClick={()=>router.push('/')}>Litter Prediction Tool</h2>
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
    <Link href="/home">
        <span
            className={`text-gray-500 font-neris hover:text-white focus:text-white hover:bg-[#5BAA76] focus:bg-[#5BAA76] hover:border-[#5BAA76] focus:border-b-2 focus:border-[#5BAA76] px-2 py-1 rounded-md ${pathname === '/home' ? 'bg-[#5BAA76] text-white' : ''}`}

        >
            
            Home
        </span>
    </Link>
</li>
<li>
    <Link href="/prediction">
        <span
            className={`text-gray-500 font-neris hover:text-white focus:text-white hover:bg-[#5BAA76] focus:bg-[#5BAA76] hover:border-[#5BAA76] focus:border-b-2 focus:border-[#5BAA76] px-2 py-1 rounded-md ${pathname === '/prediction' ? 'bg-[#5BAA76] text-white' : ''}`}

        >
            Prediction
        </span>
    </Link>
</li>
<li>
    <Link href="/analysis" className="text-gray-500 hover:text-black focus:text-black hover:border-b-2 hover:border-[#5BAA76] focus:border-b-2 focus:border-[#5BAA76]">
    <span
            className={`text-gray-500 font-neris hover:text-white focus:text-white hover:bg-[#5BAA76] focus:bg-[#5BAA76] hover:border-[#5BAA76] focus:border-b-2 focus:border-[#5BAA76] px-2 py-1 rounded-md ${pathname === '/analysis' ? 'bg-[#5BAA76] text-white' : ''}`}

        >
        Analysis
        </span>
    </Link>
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
    
    <div className="flex justify-center gap-6 cursor-pointer" onClick={()=>router.push('/user-profile')} style={{ width: '60%' }}>
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