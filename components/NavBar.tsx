import Link from "next/link";
import { ConnectKitButton } from "connectkit";

export const NavBar = () => {
  return (
    <div className="text-gray-100 bg-gray-900 body-font shadow w-full">
      <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
        <nav className="flex lg:w-2/5 flex-wrap items-center text-base md:ml-auto">
          <Link href="/registry">
            <a className="mr-5 hover:text-gray-900 cursor-pointer border-b border-transparent hover:border-indigo-600">
              Registry
            </a>
          </Link>
          <Link href="/store">
            <a className="mr-5 hover:text-gray-900 cursor-pointer border-b border-transparent hover:border-indigo-600">
              Store
            </a>
          </Link> 
        </nav>
        <Link href="/">
          <a className="flex order-first lg:order-none lg:w-1/5 title-font font-medium items-center lg:items-center lg:justify-center mb-4 md:mb-0">
            {/* <img
            src="https://pazly.dev/logo.png"
            className="h-8 mx-2"
            alt="logo"
          /> */}

            <span className="text-xl">BabyPop</span>
          </a>
        </Link>
        <div className="lg:w-2/5 inline-flex lg:justify-end ml-5 lg:ml-0">
          <ConnectKitButton />
        </div>
      </div>
    </div>
  );
};
