import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-[#FAFAFA] py-3" style={{ marginRight: '0%', marginTop: '-1%' }}>
      <div className="container mx-auto px-2">
        
        {/* ✅ FLEX CONTAINER TO ALIGN BOTH SECTIONS HORIZONTALLY */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          
          {/* ✅ Contact Info Section */}
          <div className="w-full md:w-1/2 text-left text-sm">
            <p>General Inquiries: info@kab.org</p>
            <p>Telephone Number: (203) 659-3000</p>
            <p>Physical Address: 1010 Washington Blvd Stamford CT 06901</p>
            <p>EIN: 13-1761633</p>
          </div>

          {/* ✅ About & Social Media Section */}
          <div className="w-full md:w-1/2 text-left text-sm">
            <p>Want to know more about us?</p>
            <a
              href="https://kab.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3AAD73] underline"
            >
              www.kab.org
            </a>

            {/* Social Icons - Aligned Horizontally */}
            <div className="flex space-x-3 mt-2">
              <a href="https://www.facebook.com/KeepAmericaBeautiful" target="_blank" rel="noopener noreferrer">
                <Image src="/facebook.png" alt="Facebook" width={18} height={18} />
              </a>
              <a href="https://www.instagram.com/keepamericabeautiful/" target="_blank" rel="noopener noreferrer">
                <Image src="/insta.png" alt="Instagram" width={18} height={18} />
              </a>
              <a href="https://x.com/kabtweet?mx=2" target="_blank" rel="noopener noreferrer">
                <Image src="/twitter.png" alt="Twitter" width={18} height={18} />
              </a>
              <a href="https://www.youtube.com/channel/UCwXz-YHuMvTixJAC-Vr9EIg" target="_blank" rel="noopener noreferrer">
                <Image src="/yt.png" alt="YouTube" width={18} height={18} />
              </a>
              <a href="https://www.linkedin.com/company/keepamericabeautiful" target="_blank" rel="noopener noreferrer">
                <Image src="/linkedin.png" alt="LinkedIn" width={18} height={18} />
              </a>
            </div>

            {/* Copyright Text */}
           
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;

