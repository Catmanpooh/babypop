import { useState, ChangeEvent } from "react";
import { useRouter } from "next/router";
import { connect } from "@tableland/sdk";
import { Wallet, providers } from "ethers";
import { useAccount } from "wagmi";
import { UserInput } from "../../components/UserInput";
import { MonthSelect } from "../../components/bdaySelect/MonthSelect";
import { DaySelect } from "../../components/bdaySelect/DaySelect";
import { YearSelect } from "../../components/bdaySelect/YearSelect";
import { StateSelect } from "../../components/StateSelect";
import dates from "../utils/dates.json";
import days from "../utils/days.json";
import states from "../utils/us.json";

type UserProp = {
  id?: number;
  first_name?: string;
  last_name?: string;
  location?: string;
  user_name?: string;
  wallet_address?: string;
  image?: string;
  arrival_date?: string;
  adventure?: string;
  social_profile?: string;
};

type DateOfArrival = {
  month?: string;
  day?: string;
  year?: string;
};

const adventureTypes = ["preganacy", "adoption", "surrogacy"];
const years = ["2022", "2023"];

const privateKey = process.env.PRIVATE_KEY!;
const wallet = new Wallet(privateKey);

const alchemyId = process.env.ALCHEMYID;
const provider = new providers.AlchemyProvider("maticmum", alchemyId);

const signer = wallet.connect(provider);

const babypop_user_table = process.env.BABYPOPUSERTABLE;

const Registry = () => {
  const router = useRouter();
  const { address, isConnected } = useAccount();

  const [user, setUser] = useState<UserProp | null>();
  const [babyDate, setBabyDate] = useState<DateOfArrival | null>();

  const [msg, setMsg] = useState<string | null>();

  const writeUserTable = async () => {
    const rand = Math.floor(Math.random() * 100000000000) + 1;

    if (!isConnected) {
      setMsg("Make sure you wallet is connected.");
      return;
    }

    if (
      user?.first_name === undefined ||
      user?.last_name === undefined ||
      user?.adventure === undefined ||
      babyDate?.month === undefined ||
      babyDate?.day === undefined ||
      babyDate?.year === undefined
    ) {
      setMsg("Make sure everything is filled in!");
      return;
    }

    try {
      const tableland = await connect({
        signer,
        network: "testnet",
        chain: "polygon-mumbai",
      });

      console.log("Writting to database.....");

      const writeUserRes = await tableland.write(
        `INSERT INTO ${babypop_user_table} (id, first_name, last_name, location, wallet_address, arrival_date, adventure )
        VALUES ('${rand}' ,'${user?.first_name}', '${user?.last_name}', '${user?.location}', '${address}' , '${babyDate?.month}-${babyDate?.day}-${babyDate?.year}', '${user?.adventure}');`
      );

      console.log(writeUserRes);
      router.push({
        pathname: `/user/profile/${address}`,
        query: { number: 0 },
      });
    } catch (err) {
      console.log(err);
      setMsg(
        "Error happened creating your account please try again or contact system admin"
      );
    }
  };

  return (
    <div className="h-full w-screen flex flex-col justify-center items-center">
      <main className="container my-16 mx-auto flex flex-col justify-center items-center">
        <div className="text-center h-24">
          <h1 className="flex-wrap text-4xl">Start your journey today</h1>
        </div>
        <div className="flex flex-col w-1/2">
          <UserInput
            title="First Name"
            type="text"
            placeholder="First Name"
            styles=""
            value={user?.first_name}
            isRequired={true}
            handleChange={(e: ChangeEvent<HTMLInputElement>) =>
              setUser({ ...user, first_name: e.target.value })
            }
          />

          <UserInput
            title="Last Name"
            type="text"
            placeholder="Last Name"
            styles=""
            value={user?.last_name}
            isRequired={true}
            handleChange={(e: ChangeEvent<HTMLInputElement>) =>
              setUser({ ...user, last_name: e.target.value })
            }
          />
        </div>
        <div className="flex w-1/2">
          <MonthSelect
            title="Month"
            dates={dates}
            handleChange={(e: ChangeEvent<HTMLSelectElement>) => {
              setBabyDate({ ...babyDate, month: e.target.value });
            }}
          />
          <DaySelect
            title="Day"
            days={days}
            handleChange={(e: ChangeEvent<HTMLSelectElement>) => {
              setBabyDate({ ...babyDate, day: e.target.value });
            }}
          />
          <YearSelect
            title="Year"
            years={years}
            handleChange={(e: ChangeEvent<HTMLSelectElement>) => {
              setBabyDate({ ...babyDate, year: e.target.value });
            }}
          />
        </div>

        <StateSelect
          title="Choose a State"
          states={states}
          handleChange={(e: ChangeEvent<HTMLSelectElement>) => {
            setUser({ ...user, location: e.target.value });
          }}
        />
        <div className="flex justify-between w-1/3">
          {adventureTypes.map((title, index) => {
            return (
              <button
                key={index}
                value={title}
                className="w-32 h-32 rounded overflow-hidden shadow-lg"
                onClick={() => {
                  setUser({ ...user, adventure: title });
                }}
              >
                {title.toLocaleUpperCase()}
              </button>
            );
          })}
        </div>

        <button
          className="mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          type="submit"
          onClick={writeUserTable}
        >
          Create Your Registry
        </button>
      </main>
    </div>
  );
};

export default Registry;
