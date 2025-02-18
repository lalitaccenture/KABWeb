import Image from "next/image"

const Footer = () => {
  return (
    <>
      <footer className="bg-[#FAFAFA]">
        <div className="container mx-auto px-1 pt-1 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-center">
                <Image
                  src="/kab-vertical.png"
                  alt="Logo KAB"
                  width={158}
                  height={25}
                />
              </div>
            </div>


            <div>
              <p>General Inquiries: info@kab.org</p>
              <p>Telephone Number: (203) 659-3000</p>
              <p>Physical Address: 1010 Washington Blvd Stamford CT 06901</p>
              <p>EIN: 13-1761633</p>

            </div>


            <div>

              <p>Want to know more about us?</p>
              <p className="cursor-pointer underline">
                <a
                  href="https://kab.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3AAD73] underline"
                >
                  www.kab.org
                </a>
              </p>
              {/* <div className="cursor-pointer">
                <a href="https://kab.org/" target="_blank" rel="noopener noreferrer">
                  <Image
                    src="/kab-smalllogo.png"
                    alt="KAB"
                    width={25}
                    height={25}
                    className="object-contain"
                  />
                  </a>
                </div> */}
              {/* New social media icons row */}
              <div className="flex space-x-4 mt-2">
                <div className="cursor-pointer">
                <a href="https://www.facebook.com/KeepAmericaBeautiful" target="_blank" rel="noopener noreferrer">
                  <Image
                    src="/facebook.png"
                    alt="Facebook"
                    width={25}
                    height={25}
                    className="object-contain"
                  />
                  </a>
                </div>
                <div className="cursor-pointer">
                <a href="https://www.instagram.com/keepamericabeautiful/" target="_blank" rel="noopener noreferrer">
                  <Image
                    src="/insta.png"
                    alt="Instagram"
                    width={25}
                    height={25}
                    className="object-contain"
                  />
                  </a>
                </div>
                <div className="cursor-pointer">
                <a href="https://x.com/kabtweet?mx=2" target="_blank" rel="noopener noreferrer">
                  <Image
                    src="/twitter.png"
                    alt="Twitter"
                    width={25}
                    height={25}
                    className="object-contain"
                  />
                  </a>
                </div>
                <div className="cursor-pointer">
                <a href="https://www.youtube.com/channel/UCwXz-YHuMvTixJAC-Vr9EIg?themeRefresh=1" target="_blank" rel="noopener noreferrer">
                  <Image
                    src="/yt.png"
                    alt="YouTube"
                    width={25}
                    height={25}
                    className="object-contain"
                  />
                  </a>
                </div>
                <div className="cursor-pointer">
                <a href="https://www.linkedin.com/company/keepamericabeautiful" target="_blank" rel="noopener noreferrer">
                  <Image
                    src="/linkedin.png"
                    alt="LinkedIn"
                    width={25}
                    height={25}
                    className="object-contain"
                  />
                  </a>
                </div>

              </div>
              <p className="text-sm text-gray-600 font-neris mt-3">Keep America Beautiful © Copyright 2025</p>
              {/* <p className="mt-4 text-lg font-semibold">Coming soon</p>


              <div className="grid grid-cols-2 mt-4">
                <div className="flex">
                  <Image
                    src="/ai-assist.png"
                    alt="Image 1"
                    width={150}
                    height={25}
                    className="object-contain"
                  />
                </div>

                <div className="flex">
                  <Image
                    src="/ai-assistan.png"
                    alt="Image 2"
                    width={58}
                    height={25}
                    className="object-contain"
                  />
                </div>

              </div> */}
            </div>
          </div>
        </div>
        {/* Copyright section */}
        {/* <div className="w-full text-center mt-auto py-4">
          <p className="text-sm text-gray-600 font-neris">Keep America Beautiful © Copyright 2025</p>
        </div> */}
      </footer>
    </>
  )
}


export default Footer