"use client";

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { MdLogout } from "react-icons/md";
import { FaUserCircle } from "react-icons/fa";
import { signOut, useSession } from "next-auth/react";
import { getViewProfile, postEditProfile } from '@/app/utils/api';
import dynamic from 'next/dynamic';
import { useProfileStore } from '@/stores/profileStore';
const Select = dynamic(() => import('react-select'), { ssr: false });
const UserProfile = () => {

  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState('');
  const [lastlogin, setLastlogin] = useState('');
  const [userName, setUserName] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('');
  const [target, setTarget] = useState('');
  const [region, setRegion] = useState('LA County, California');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const [stateVal,setStateVal] = useState<any>();
  const router = useRouter();

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const customSelectStyles = {
    container: (base: any) => ({
      ...base,
      width: '80%', // 👈 80% width
    }),
    control: (base: any, state: any) => ({
      ...base,
      width: '100%',
      borderColor: '#D1D5DB', // 👈 Tailwind's border-gray-300
      borderWidth: 1,
      boxShadow: state.isFocused ? '0 0 0 1px #5BAA76' : 'none',
      '&:hover': {
        borderColor: '#5BAA76',
      },
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? '#E6F5EC' : 'white',
      color: '#000000',
      '&:hover': {
        backgroundColor: '#5BAA76',
        color: '#fff',
      },
    }),
    singleValue: (base: any) => ({
      ...base,
      color: '#000000',
      fontWeight: 500,
    }),
    placeholder: (base: any) => ({
      ...base,
      color: '#A0AEC0',
    }),
  };
  
  
  function formatToUSDateTime(isoString:any) {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      timeZone: "America/New_York", // Adjust as needed
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    });
  }

  useEffect(() => {
    if (session?.user?.email) {
      const fetchData = async () => {
        const data = await getViewProfile({ email: session.user.email });
        setUserName(data?.username)
        setEmail(data?.email)
        setStateVal(data?.state)
        setLastlogin(formatToUSDateTime(data?.timestamp))
        setOrganization(data?.organization)
        setRole(data?.role)
        setTarget(data?.target)
      };
  
      fetchData();
    }
  }, [session?.user?.email]);
  

  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
    const payload =   {
        "email": email,
        "username": userName,
        "state": stateVal,
        "organization": organization,
        "role": role,
        "target": target,
        // "fullOption": "0",
        // "is_verified": "true"
     }
     const data = await postEditProfile(payload);
      if (data) {
        useProfileStore.getState().setState(stateVal);
        setSaveSuccess('Profile updated successfully!');
      }
      

     else {
        throw new Error('Failed to save the profile');
      }
    } catch (error) {
      setSaveSuccess('Error saving profile. Please try again!');
    } finally {
      setIsSaving(false);
      setIsEditing(false)
    }
  };

  const handleLogoClick = () => {
    if (status === "authenticated") {
      router.push("/analysis-external");
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

  const regions = [
    {
        "value": "Alabama",
        "label": "Alabama"
    },
    {
        "value": "Alaska",
        "label": "Alaska"
    },
    {
        "value": "Arizona",
        "label": "Arizona"
    },
    {
        "value": "Arkansas",
        "label": "Arkansas"
    },
    {
        "value": "California",
        "label": "California"
    },
    {
        "value": "Colorado",
        "label": "Colorado"
    },
    {
        "value": "Connecticut",
        "label": "Connecticut"
    },
    {
        "value": "Delaware",
        "label": "Delaware"
    },
    {
        "value": "District Of Columbia",
        "label": "District Of Columbia"
    },
    {
        "value": "Florida",
        "label": "Florida"
    },
    {
        "value": "Georgia",
        "label": "Georgia"
    },
    {
        "value": "Hawaii",
        "label": "Hawaii"
    },
    {
        "value": "Idaho",
        "label": "Idaho"
    },
    {
        "value": "Illinois",
        "label": "Illinois"
    },
    {
        "value": "Indiana",
        "label": "Indiana"
    },
    {
        "value": "Iowa",
        "label": "Iowa"
    },
    {
        "value": "Kansas",
        "label": "Kansas"
    },
    {
        "value": "Kentucky",
        "label": "Kentucky"
    },
    {
        "value": "Louisiana",
        "label": "Louisiana"
    },
    {
        "value": "Maine",
        "label": "Maine"
    },
    {
        "value": "Maryland",
        "label": "Maryland"
    },
    {
        "value": "Massachusetts",
        "label": "Massachusetts"
    },
    {
        "value": "Michigan",
        "label": "Michigan"
    },
    {
        "value": "Minnesota",
        "label": "Minnesota"
    },
    {
        "value": "Mississippi",
        "label": "Mississippi"
    },
    {
        "value": "Missouri",
        "label": "Missouri"
    },
    {
        "value": "Montana",
        "label": "Montana"
    },
    {
        "value": "Nebraska",
        "label": "Nebraska"
    },
    {
        "value": "Nevada",
        "label": "Nevada"
    },
    {
        "value": "New Hampshire",
        "label": "New Hampshire"
    },
    {
        "value": "New Jersey",
        "label": "New Jersey"
    },
    {
        "value": "New Mexico",
        "label": "New Mexico"
    },
    {
        "value": "New York",
        "label": "New York"
    },
    {
        "value": "North Carolina",
        "label": "North Carolina"
    },
    {
        "value": "North Dakota",
        "label": "North Dakota"
    },
    {
        "value": "Ohio",
        "label": "Ohio"
    },
    {
        "value": "Oklahoma",
        "label": "Oklahoma"
    },
    {
        "value": "Oregon",
        "label": "Oregon"
    },
    {
        "value": "Pennsylvania",
        "label": "Pennsylvania"
    },
    {
        "value": "Rhode Island",
        "label": "Rhode Island"
    },
    {
        "value": "South Carolina",
        "label": "South Carolina"
    },
    {
        "value": "South Dakota",
        "label": "South Dakota"
    },
    {
        "value": "Tennessee",
        "label": "Tennessee"
    },
    {
        "value": "Texas",
        "label": "Texas"
    },
    {
        "value": "Utah",
        "label": "Utah"
    },
    {
        "value": "Vermont",
        "label": "Vermont"
    },
    {
        "value": "Virginia",
        "label": "Virginia"
    },
    {
        "value": "Washington",
        "label": "Washington"
    },
    {
        "value": "West Virginia",
        "label": "West Virginia"
    },
    {
        "value": "Wisconsin",
        "label": "Wisconsin"
    },
    {
        "value": "Wyoming",
        "label": "Wyoming"
    }
]
  return (
    <div className="bg-[#5BAA761A] overflow-hidden pt-24">

      <div className="flex w-full max-w-screen-xl m">

        {/* Sidebar */}
        <div className="w-[20%] p-4 bg-white shadow-2xl rounded-lg flex flex-col justify-between  mt-[-12%]" style={{marginBottom:'38px', height:'30.5rem'}}>

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
                  onClick={() => router.push("/analysis-external")}
                >
                  <span className="font-neris text-sm">Analysis</span>
                </button>
                <button
                  className="flex items-center gap-2 p-2 bg-gray-100 text-gray-700 rounded-lg w-full"
                  onClick={() => router.push("/prediction")}
                >
                  <span className="font-neris text-sm">Prediction</span>
                </button>
             

              </div>
            </div>
          </div>

          {/* Bottom */}
          <div>
            <div className="flex justify-center mb-2">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#5BAA76] text-white rounded-lg transition-all hover:bg-[#5BAA76]"
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
        <div className="w-[80%] flex items-center justify-center h-full" style={{ marginTop: '-7%' }}>

    
  {/* Profile Card */}
  <div className="flex flex-col md:flex-row items-start bg-[#f5fdf7] p-8 rounded-md border shadow-md gap-8">
    
    {/* Profile Image Section - now on the left */}
    <div className="relative w-[150px] h-[150px] flex-shrink-0">
      <div className="w-full h-full flex justify-center items-center">
        <FaUserCircle size={80} color="#5BAA76" />
      </div>
      <button
        onClick={handleEditClick}
        className="absolute top-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-200"
      >
        <Image src="/edit.png" alt="Edit Icon" width={15} height={15} />
      </button>
    </div>

    {/* Info Section */}
   {/* Info Section */}
<div className="flex flex-col text-left w-full">
  {/* Name Input */}
  <div className="text-3xl font-bold mb-6">
    {isEditing ? (
      <div className="w-full">
        <label htmlFor="username" className="block font-neris text-sm mb-1">User Name:</label>
        <input
          id="username"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="text-xl font-bold bg-white border border-gray-300 rounded-md p-2 focus:outline-none w-full"
        />
      </div>
    ) : (
      <span className="font-neris">{userName}</span>
    )}
  </div>

  {/* Form Grid */}
  {isEditing ? (
    <div className="flex flex-col gap-6">
      {/* Row 1 */}
      <div className="flex flex-wrap gap-4">
        {[
          { label: 'Email', value: email, onChange: setEmail, editable: false },
          { label: 'Organization', value: organization, onChange: setOrganization, editable: true },
          { label: 'Role', value: role, onChange: setRole, editable: true },
        ].map(({ label, value, onChange, editable }) => (
          <div key={label} className="flex-1 min-w-[200px]">
            <label htmlFor={label} className="block text-sm text-gray-700 mb-1">{label}:</label>
            <input
              id={label}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              disabled={!editable}
              className={`rounded-md p-2 w-full focus:outline-none ${
                editable
                  ? 'bg-white border border-gray-300 focus:ring-2 focus:ring-[#5BAA76]'
                  : 'bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Row 2 */}
      <div className="flex flex-wrap gap-4">
        {[
          { label: 'Target', value: target, onChange: setTarget, editable: true, isDropdown: false },
          { label: 'Region', value: stateVal, onChange: setStateVal, editable: true, isDropdown: true },
          { label: 'Last Login (ET – Eastern Time)', value: lastlogin, onChange: setLastlogin, editable: false, isDropdown: false },
        ].map(({ label, value, onChange, editable, isDropdown }) => (
          <div key={label} className="flex-1 min-w-[200px]">
            <label htmlFor={label} className="block text-sm text-gray-700 mb-1">{label}:</label>
            {isDropdown ? (
              <Select
                id={label}
                value={regions.find(option => option.value === stateVal)}
                placeholder="Select a State"
                onChange={(selectedOption: any) => onChange(selectedOption?.value)}
                options={regions}
                styles={customSelectStyles}
              />
            ) : (
              <input
                id={label}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                disabled={!editable}
                className={`rounded-md p-2 w-full focus:outline-none ${
                  editable
                    ? 'bg-white border border-gray-300 focus:ring-2 focus:ring-[#5BAA76]'
                    : 'bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="text-lg space-y-2 font-neris">
      {[
        { label: 'Email', value: email },
        { label: 'Organization', value: organization },
        { label: 'Role', value: role },
        { label: 'Target', value: target },
        { label: 'Region', value: stateVal },
        { label: 'Last Login (ET – Eastern Time)', value: lastlogin },
      ].map(({ label, value }) => (
        <div key={label}>
          <span className="font-semibold text-medium">{label}:</span> {value}
        </div>
      ))}
    </div>
  )}

  {/* Save Button */}
  {isEditing && (
    <div className="mt-5 text-left">
      <button
        onClick={handleSaveClick}
        disabled={isSaving}
        className={`p-2 rounded-md ${isSaving ? 'bg-gray-400' : 'bg-[#3AAD73]'} text-white`}
      >
        {isSaving ? 'Saving...' : 'Save'}
      </button>
    </div>
  )}

  {/* Success Message */}
  {saveSuccess && (
    <div className={`mt-2 text-lg text-left ${saveSuccess.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
      {saveSuccess}
    </div>
  )}
</div>

  </div>


        </div>
      </div>
    </div>
  );

};

export default UserProfile;