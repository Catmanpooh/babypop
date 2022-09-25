import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/router";
import type { NextPage } from "next";
import Link from "next/link";
import { UserInput } from "../components/UserInput";

const Home: NextPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string | undefined>();
  const [msg, setMsg] = useState<string | undefined>();
  const [hidden, setHidden] = useState<boolean>(false);

  const [fullName, setFullName] = useState<string | undefined>();
  const [searchAddress, setSearchAddress] = useState<string | undefined>();

  const searchUserProfile = () => {
    if (searchAddress === undefined && fullName === undefined) {
      setMsg("Please enter a address | username | first or last name.");
      return;
    }

    if (!searchAddress?.includes("0x") && fullName === undefined) {
      setMsg("Please enter a correct address or full name.");
    } else if (!searchAddress?.includes("0x") && fullName !== undefined) {
      router.push({
        pathname: `/user/profile`,
        query: { number: 1, term: fullName },
      });
    } else if (searchAddress?.includes("0x")) {
      router.push(`/user/${searchAddress}`);
    } else if (searchAddress?.includes("0x")) {
      router.push(`/user/${searchAddress}`);
    } else {
      router.push({
        pathname: `/user/profile`,
        query: { number: 1, term: fullName },
      });
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setHidden(!hidden);
    }, 10000);
  }, [searchUserProfile]);

  return (
    <div className="w-screen flex flex-col justify-center items-center">
      <main className="container  my-16 w-3/4 h-96 flex flex-col justify-center items-center">
        <div className="text-center h-24">
          <h1 className="flex-wrap text-4xl">
            With love and care for every parent on a journey.
          </h1>
        </div>
        {msg !== undefined ? (
          <p
            className={`text-lg text-red-600 my-4 ${hidden ? "hidden" : null}`}
          >
            {msg}
          </p>
        ) : null}

        <UserInput
          title="Address"
          type="text"
          placeholder="Find Registry by Address"
          styles="w-1/2"
          value={searchTerm}
          isRequired={true}
          handleChange={(e: ChangeEvent<HTMLInputElement>) => {
            setSearchAddress(e.target.value);
          }}
        />

        <UserInput
          title=""
          type="text"
          placeholder="Full Name Search"
          styles="w-1/2"
          value={searchTerm}
          isRequired={true}
          handleChange={(e: ChangeEvent<HTMLInputElement>) => {
            setFullName(e.target.value);
          }}
        />

        <div className="flex flex-col w-3/4 h-28 justify-between items-center">
          <button
            className="mt-4 w-1/4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            onClick={searchUserProfile}
          >
            Lets Go Find It
          </button>
          <p className="text-sm font-light">or</p>
          <Link href={"/registry"}>
            <a className="text-sm font-light underline">Create a Registry</a>
          </Link>
        </div>
      </main>
    </div>
  );
};



export default Home;
