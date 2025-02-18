'use client';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FaChevronDown } from "react-icons/fa";

interface UserIconProps {
  src: string;
  alt?: string;
  username: string; 
}

export default function UserIcon({ src, alt = "User Avatar", username }: UserIconProps) {
  const router = useRouter();
  return (
    <div className="flex items-center space-x-2">
      <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-300">
        <Image
          src={src}
          alt={alt}
          width={48}
          height={48}
          className="object-cover"
        />
      </div>
      <span className="text-sm font-medium font-neris">{username}</span> 
      <FaChevronDown className="text-gray-500 cursor-pointer" size={16} />
    </div>
  );
}
