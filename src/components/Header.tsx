'use client';

import Image from "next/image"
import Link from "next/link"
import UserIcon from "./UserIcon";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { signOut, useSession } from "next-auth/react";

const Header = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [activeTab, setActiveTab] = useState(pathname);

    const analysisPaths = ['/analysis-external', '/analysis-kab'];
    
    const showTooltip = ['/prediction', ...analysisPaths, '/user-profile'].includes(pathname);

    const handleAnalysisClick = (e: React.MouseEvent) => {
        router.push('/analysis-external');
    };

    useEffect(() => {
        if (!pathname.startsWith('/analysis')) {
            setIsDropdownVisible(false);
        }

        if (pathname.startsWith('/analysis')) {
            setActiveTab('/analysis');
        } else {
            setActiveTab(pathname);
        }
    }, [pathname]);

    const handleLogoClick = () => {
        if (status === "authenticated") {
            router.push("/home");
        } else {
            router.push("/");
        }
    };

    const handleLogout = async () => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            await signOut({ redirect: false });
            router.push("/");
            console.log("Logged out");
        } else {
            console.log("Logout canceled");
        }
    };

    return (
        <div className="w-full flex px-6 items-center justify-between" style={{ height: '5rem' }}>
            {status === "authenticated" && (
                <div className="w-1/3 p-2 flex items-center">
                    <nav className="w-full">
                        <ul className="flex justify-start gap-12 w-full" style={{ justifyContent: 'center', marginLeft: '20%' }}>
                            <li>{/* Home Nav Placeholder */}</li>
                            <li>{/* Prediction Nav Placeholder */}</li>
                            <li className="relative">{/* Analysis Button Placeholder */}</li>
                        </ul>
                    </nav>
                </div>
            )}

            <div className={`flex items-center ${status === "authenticated" ? "gap-6" : "justify-end w-1/3"}`}>
                {status === "authenticated" && (
                    <div className="flex gap-2 items-center">
                        
                        {showTooltip && (
                            <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                                <div style={{ marginLeft: '-1%' }}>
                                    <span className="font-medium">
                                        {pathname === '/prediction' && (
                                            <div className="w-full text-center">
                                                <p className="text-xl font-bold text-gray-800">Litter Prediction Dashboard</p>
                                                <p className="text-xs text-gray-600 mt-1 whitespace-nowrap">
                                                    Generate weekly litter maps and visualize hotspots, bins, and amenities in real time, allowing for better planning of litter reduction measures
                                                </p>
                                            </div>
                                        )}

                                        {analysisPaths.includes(pathname) && (
                                            <div className="w-full flex justify-center">
                                                <div className="text-center">
                                                    <p className="text-xl font-bold text-gray-800">Litter Analysis Dashboard</p>
                                                    <p className="text-xs text-gray-600 mt-1 max-w-3xl whitespace-nowrap">
                                                        Explore detailed trends, stats, and historical patterns to understand how litter in your region changes over time
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {pathname === '/user-profile' && (
                                            <div className="w-full flex justify-center" style={{marginLeft:'35%'}}>
                                                <div className="text-center">
                                                    <p className="text-xl font-bold text-gray-800">User Profile</p>
                                                    <p className="text-xs text-gray-600 mt-1 max-w-3xl whitespace-nowrap">
                                                    View your profile details, including your name and last login information.

                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div onClick={() => router.push("/user-profile")} className="flex items-center gap-2 cursor-pointer">
                            <FaUserCircle size={40} color="#5BAA76" />
                            <span className="ml-2 text-md font-neris text-gray-500">
                                {/* @ts-ignore */}
                                {session?.user?.username}
                            </span>
                        </div>

                        {/* Logout button is optional and currently commented out */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Header;
