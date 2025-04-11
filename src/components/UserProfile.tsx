"use client";

import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from "next/navigation";
import { MdLogout } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import { signOut, useSession } from "next-auth/react";
const UserProfile = () => {

  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState('mayank.swarrowp@accenture.com');
  const [lastlogin, setLastlogin] = useState('2nd april 2025');
  const [userName, setUserName] = useState('Michael Johnson');
  const [organization, setOrganization] = useState('Keep America Beautiful');
  const [role, setRole] = useState('Program Manager');
  const [target, setTarget] = useState('Leverage Data for better city services');
  const [region, setRegion] = useState('LA County, California');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveClick = async () => {
    setIsSaving(true);
    try {

      const response = await fetch('/api/updateUserProfile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          userName,
          organization,
          role,
          target,
          region,
          lastlogin
        }),
      });

      if (response.ok) {
        setSaveSuccess('Profile updated successfully!');
      } else {
        throw new Error('Failed to save the profile');
      }
    } catch (error) {
      setSaveSuccess('Error saving profile. Please try again!');
    } finally {
      setIsSaving(false);
    }
  };

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
      await signOut({ redirect: false }); // Prevents full page reload
      router.push("/");
      console.log("Logged out");
    }
    else {
      console.log("Logout canceled");
    }
  };
  return (
    <div className="bg-[#5BAA761A] min-h-screen pt-24">
      <div className="flex w-full max-w-screen-xl m">

        {/* Sidebar */}
        <div className="w-[20%] p-4 bg-white shadow-2xl rounded-lg flex flex-col justify-between  mt-[-12%]" style={{marginBottom:'38px'}}>

          {/* Top Section */}
          <div>
            <div className="flex flex-col items-center mt-[-6%]">
              <p
                className="text-[#5BAA76] text-xl font-bold cursor-pointer font-neris"
                onClick={handleLogoClick}
              >
                LitterSense
              </p>
              <Image
                src="/powered.png"
                alt="Accenture"
                width={100}
                height={14}
                className="object-contain mt-[-4px]"
              />
            </div>

            {/* Menu */}
            <div className="mt-6">
              <p className="text-gray-400 text-sm font-semibold mb-2">Menu</p>
              <div className="flex flex-col gap-2">
                <button
                  className="flex items-center gap-2 p-2 bg-gray-100 text-gray-700 rounded-lg w-full"
                  onClick={() => router.push("/prediction")}
                >
                  <span className="font-neris text-sm">Prediction</span>
                </button>
                <button
                  className="flex items-center gap-2 p-2 bg-gray-100 text-gray-700 rounded-lg w-full"
                  onClick={() => router.push("/analysis-external")}
                >
                  <span className="font-neris text-sm">Analysis</span>
                </button>

              </div>
            </div>
          </div>

          {/* Bottom */}
          <div>
            <div className="flex justify-center mb-2">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#5BAA76] text-white rounded-lg transition-all hover:bg-[#4A9463]"
                title="Logout"
              >
                <MdLogout size={20} />
                <span>Logout</span>
              </button>
            </div>

            <div className="flex justify-center">
              <p className="text-xs text-gray-600 whitespace-nowrap">
                Keep America Beautiful © Copyright 2025
              </p>
            </div>

            <div className="flex justify-center mt-2">
              <Image
                src="/kab.png"
                alt="Logo KAB"
                width={178}
                height={28}
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-[80%] flex items-center justify-center min-h-screen pb-10" style={{ marginTop: '-7%' }}>
          <div className="bg-white py-10 px-5 w-full max-w-4xl">
            {/* Profile Card */}
            <div className="flex flex-col items-center bg-[#f5fdf7] p-8 rounded-md border shadow-md">

              {/* Image at top */}
              <div className="relative flex justify-center items-center w-[150px] h-[150px] mb-6">
                <div style={{ width: '80px', height: '80px' }}>
                  <FaUserCircle size={80} color="#5BAA76" />
                </div>

                <button
                  onClick={handleEditClick}
                  className="absolute top-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-200"
                >
                  <Image src="/edit.png" alt="Edit Icon" width={24} height={24} />
                </button>
              </div>

              {/* Info */}
              <div className="flex flex-col text-center md:text-left w-full max-w-md">
                <div className="text-3xl font-bold mb-4 text-center">
                  {isEditing ? (
                    <>
                     <div className="w-full max-w-md mx-auto text-left">
  <label htmlFor="username" className="block font-neris text-sm mb-1">
    User Name:
  </label>
  <input
    id="username"
    type="text"
    value={userName}
    onChange={(e) => setUserName(e.target.value)}
    className="text-2xl font-bold bg-white border-2 border-[#3AAD73] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#5BAA76] w-full"
  />
</div>

                    </>
                  ) : (
                    <span className="font-neris">{userName}</span>
                  )}
                </div>

                <div className="text-lg space-y-3 font-neris">
                  {[
                    { label: 'Email', value: email, onChange: setEmail , },
                    { label: 'Organization', value: organization, onChange: setOrganization },
                    { label: 'Role', value: role, onChange: setRole },
                    { label: 'Target', value: target, onChange: setTarget },
                    { label: 'Region', value: region, onChange: setRegion },
                    { label: 'Last Login', value: lastlogin, onChange: setLastlogin }
                  ].map(({ label, value, onChange }) => (
                    <div key={label}>
                      {isEditing ? (
                        <>
                          <label htmlFor={label} className="block text-sm text-gray-700">{label}:</label>
                          <input
                            id={label}
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            className="bg-white border-2 border-[#3AAD73] rounded-md p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#5BAA76]"
                          />
                        </>
                      ) : (
                        <span>
                          <span className="font-semibold text-medium">{label}:</span> {value}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {isEditing && (
                  <div className="mt-5 text-center">
                    <button
                      onClick={handleSaveClick}
                      disabled={isSaving}
                      className={`p-2 rounded-md ${isSaving ? 'bg-gray-400' : 'bg-[#3AAD73]'} text-white`}
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}

                {saveSuccess && (
                  <div className={`mt-2 text-lg text-center ${saveSuccess.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                    {saveSuccess}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};

export default UserProfile;
