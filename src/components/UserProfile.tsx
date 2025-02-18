"use client";

import Image from 'next/image';
import { useState } from 'react';

const UserProfile = () => {

  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useState('Michael Johnson');
  const [organization, setOrganization] = useState('Keep America Beautiful');
  const [role, setRole] = useState('Program Manager');
  const [target, setTarget] = useState('Leverage Data for better city services');
  const [region, setRegion] = useState('LA County, California');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

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
          userName,
          organization,
          role,
          target,
          region,
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

  return (
    <div className="bg-[#5BAA761A] pt-24">
      <div className="bg-white p-5 mx-auto max-w-7xl">
        <div className="flex justify-between p-8 mx-auto max-w-7xl">
          {/* Left Section - Image */}
          <div className="relative flex justify-center items-center w-[35%] h-[150px]">
            <Image
              src="/usertest.png"
              alt="User Image"
              width={150}
              height={150}
              className="rounded-full absolute"
            />
            <button
              onClick={handleEditClick}
              className="absolute top-0 right-0 p-2 bg-white rounded-full shadow-lg hover:bg-gray-200"
            >
              <Image
                src="/edit.png"
                alt="Edit Icon"
                width={24}
                height={24}
              />
            </button>
          </div>

          {/* Right Section - User Info */}
          <div className="flex flex-col justify-center pl-5 w-[65%] text-left">
            <div className="text-4xl font-bold mb-2">
              {isEditing ? (
                <>
                  <label htmlFor="organization" className="block font-neris text-sm font-medium text-gray-700">
                    User name:
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="text-4xl font-bold mb-2 bg-white border-2 border-[#3AAD73] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#5BAA76]"
                  />
                </>
              ) : (
                <span className='font-neris'>User name: {userName}</span>
              )}
            </div>

            <div className="text-lg space-y-2">
              <div>
                {isEditing ? (
                  <>
                    <label htmlFor="organization" className="block font-neris text-sm font-medium text-gray-700">
                      Organization:
                    </label>
                    <input
                      id="organization"
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="bg-white border-2 border-[#3AAD73] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#5BAA76]"
                    />
                  </>
                ) : (
                  <span className='font-neris'>Organization: {organization}</span>
                )}
              </div>
              <div>
                {isEditing ? (
                  <>
                    <label htmlFor="role" className="block font-neris text-sm font-medium text-gray-700">
                      Role:
                    </label>
                    <input
                      id="role"
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="bg-white border-2 border-[#3AAD73] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#5BAA76]"
                    />
                  </>
                ) : (
                  <span className='font-neris'>Role: {role}</span>
                )}
              </div>
              <div>
                {isEditing ? (
                  <>
                    <label htmlFor="target" className="block font-neris text-sm font-medium text-gray-700">
                      Target:
                    </label>
                    <input
                      id="target"
                      type="text"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      className="bg-white border-2 border-[#3AAD73] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#5BAA76]"
                    />
                  </>
                ) : (
                  <span className='font-neris'>Target: {target}</span>
                )}
              </div>
              <div>
                {isEditing ? (
                  <>
                    <label htmlFor="region" className="block font-neris text-sm font-medium text-gray-700">
                      Region:
                    </label>
                    <input
                      id="region"
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="bg-white border-2 border-[#3AAD73] rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#5BAA76]"
                    />
                  </>
                ) : (
                  <span className='font-neris'>Region: {region}</span>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="mt-5">
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
              <div className={`mt-2 text-lg ${saveSuccess.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
                {saveSuccess}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 p-5 mx-auto max-w-7xl px-16">
          <div className="text-3xl font-bold mb-4 font-neris">History of Searches</div>
          <div className="flex flex-col">
            <div className="flex justify-between mb-2">
              <p className="w-[30%] font-neris">Date</p>
              <p className="w-[70%] font-neris">Time</p>
            </div>
            <div className="flex justify-between">
              <p className="w-[30%] font-neris">2025-02-07</p>
              <p className="w-[70%] font-neris">14:30</p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-5 mx-auto max-w-7xl px-16">
          <div className="text-3xl font-neris font-bold mb-4">Saved Items</div>
          <div className="flex flex-col">
            <div className="flex justify-between mb-2">
              <p className="w-[30%] font-neris">Date</p>
              <p className="w-[70%] font-neris">Time</p>
            </div>
            <div className="flex justify-between">
              <p className="w-[30%] font-neris">2025-02-07</p>
              <p className="w-[70%] font-neris">15:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
