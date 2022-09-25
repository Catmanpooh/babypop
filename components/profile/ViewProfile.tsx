import { NextRouter } from "next/router";
import dates from "../../pages/utils/dates.json";

interface ReadQueryResult<R extends Rows = Array<any>> {
  columns: Columns;
  rows: R;
}

// For context
type Columns = Array<{ name: string }>;
type Rows = Array<string | number | boolean>;

type Dates = {
  name: string;
  short: string;
  number: number;
  days: number;
};

export const ViewUserProfile = (
  userTableProfile: ReadQueryResult,
  router: NextRouter,
  address: string,
  userTableProduct: ReadQueryResult
) => {
  const ProductView = () => {
    return (
      <div className="flex">
        {userTableProduct?.rows.map((product, index) => {
          return (
            <div className="py-6" key={index}>
              <div className="flex max-w-md bg-white shadow-lg rounded-lg overflow-hidden">
                <img className="w-1/3" src={product[2]} alt="product image" />
                <div className="w-2/3 p-4">
                  <h1 className="text-gray-900 font-bold text-2xl">
                    {product[1]}
                  </h1>
                  <p className="mt-2 text-gray-600 text-sm">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit In
                    odit exercitationem fuga id nam quia
                  </p>

                  <div className="flex item-center justify-between mt-3">
                    <h1 className="text-gray-700 font-bold text-xl">
                      Matic: {product[4]}
                    </h1>
                    {userTableProfile?.rows.length !== 0 ? (
                      <button
                        className="px-3 py-2 bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold uppercase rounded-full"
                        onClick={() => {
                          console.log("hello");

                          //   setPayForItem({ to: product[6], value: product[4] });
                          //   sendTransaction
                        }}
                      >
                        Purchase
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const fullName = `${userTableProfile?.rows[0][1]} ${userTableProfile?.rows[0][2]}`;
  const arrivalDate = userTableProfile?.rows[0][7].split("-");
  const month = dates.find((date: Dates) => date.number == arrivalDate[0]);
  const imageSrc = userTableProfile?.rows[0][6];
  const userName = userTableProfile?.rows[0][5];

  const x = [1, 2, 3, 4];
  return (
    <div className="flex flex-col justify-between items-center tracking-wide">
      <div className="flex flex-col justify-between items-center">
        {imageSrc !== null ? (
          <img
            className="rounded-full border border-gray-100 shadow-sm w-32 h-32 my-4"
            src={imageSrc}
            alt="User Profile Image"
          />
        ) : null}
        {address === userTableProfile?.rows[0][4] ? (
          <button
            className="mt-8 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            onClick={() => router.push(`/user/profile/edit/${address}`)}
          >
            Update Profile
          </button>
        ) : null}
        <p className="my-4 text-2xl">
          {" "}
          <span className="font-semibold">{fullName.toUpperCase()}'s</span> Baby
          Registry
        </p>
        <p className="my-2 text-md">
          Arrival Date
          <span className=" mx-2 font-semibold underline decoration-1	">
            {month?.name} {arrivalDate[1]}, {arrivalDate[2]}
          </span>
        </p>
      </div>
      {userName !== null ? (
        <div className="flex no-scrollbar overflow-x-scroll w-3/4 my-8">
          {x.map((element) => {
            return (
              <div className="w-32 h-40 mx-4 rounded shadow-lg">
                <p className="">{element}</p>
              </div>
            );
          })}
        </div>
      ) : null}
      {userTableProduct?.rows.length !== 0 ? <ProductView /> : null}
    </div>
  );
};
