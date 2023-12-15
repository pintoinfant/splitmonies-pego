import * as React from "react";
import { ReactNode } from "react";
import { ReceiptPercentIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import protobuf from "protobufjs";
import { useContractRead, useConnect } from "wagmi";
import { CONTRACT_ABIS } from "@/utilities/contractDetails";
import { useAccount, useContractWrite } from "wagmi";
import { useRouter } from "next/router";
import { superShortenAddress } from "@/utilities/shortenAddress";
import axios from "axios";
import { InjectedConnector } from "wagmi/connectors/injected";
import {hexToNumber} from "viem"

interface Props {
  children: ReactNode;
}

const GroupPage = () => {
  const router = useRouter();
  // const id = router.query.id;

  // const progressCallback = (progressData) => {
  //   let percentageDone =
  //     100 - (progressData?.total / progressData?.uploaded)?.toFixed(2);
  //   console.log(percentageDone);
  // };

  const { isLoading: paySplitLoading, writeAsync: paySplitAsync } =
    useContractWrite({
      abi: CONTRACT_ABIS.SplitMoneyContract.abi,
      address: CONTRACT_ABIS.SplitMoneyContract.address as `0x${string}`,
      functionName: "paySplit",
    });

  const handleSubmit = async (id: any) => {
    setTransactionLoading(true);
    // console.log(image)
    await paySplitAsync({
      args: [id],
    });
    setTransactionLoading(false);
  };

  const [transactionLoading, setTransactionLoading] = useState(false);

  const [expenses, setExpenses] = useState<any>();
  const [groupImageHash, setGroupImageHash] = useState<any>([]);

  const getGroupImageCID = () => {
    if (router.isReady) {
      fetch('/api/groups?address=' + address).then((res) => res.json()).then((data) => {
      //  console.log(data.groups)
      let images = {};
      data.groups.map((group) => {
        // console.log()
        images[String(hexToNumber(group.args[0]._hex))] = group.args[5]
        // hexToNumber(group.args[0]._hex) : group.args[5]
        })
      setGroupImageHash(images)
      })
     }
    // axios.post(apiUrl, { query }, { headers }).then((res) => {
    //   let images = {};
    //   let imageCID: any = res.data.data.groupCreateds;
    //   imageCID.map((group: any) => {
    //     images[group.groupId] = group.groupImage;
    //   });
    //   // console.log(images)
    //   // images[imageCID]
    //   setGroupImageHash(images);
    // });
  };

  const { address } = useAccount();
  const {
    data: expenseData,
    refetch: expenseDataRefetch,
    isLoading: expenseDataLoading,
  } = useContractRead({
    abi: CONTRACT_ABIS.SplitMoneyContract.abi,
    address: CONTRACT_ABIS.SplitMoneyContract.address as `0x${string}`,
    functionName: "viewSplits",
    // args: [id],
    account: address,
  });

  useEffect(() => {
    if (address && router.isReady) {
      expenseDataRefetch();
    }
  }, [address, router.isReady]);

  useEffect(() => {
    if (!expenseDataLoading) {
      getGroupImageCID();
      console.log(expenseData);
      setExpenses(expenseData);
    }
  }, [expenseData, expenseDataLoading]);

  const { isLoading: approveLoading, writeAsync: approveAsync } =
  useContractWrite({
    abi: CONTRACT_ABIS.SMTokenContract.abi,
    address: CONTRACT_ABIS.SMTokenContract.address as `0x${string}`,
    functionName: "approve",
  });

  return (
    <div className="my-5 chat-interface h-full grow flex flex-col">
      <div className="text-2xl font-extrabold">Group Expenses</div>
      <button
                  type="submit"
                  onClick={() => approveAsync({
                    args: [CONTRACT_ABIS.SplitMoneyContract.address, 1000000],
                  })
                  }
                  className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 my-4"
                >
                  Approve 1000000 DAI
                </button>
      {!expenseDataLoading && (
        <div className="mt-3">
          {expenses?.map((expense: any, index: number) => (
            <div
              key={index}
              className="py-2.5 flex items-center justify-between"
            >
              <div className="flex items-center">
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className="inline-block h-14 w-14 rounded-full"
                    src={`https://gateway.lighthouse.storage/ipfs/${
                      groupImageHash[parseInt(expense.groupId)]
                    }`}
                    // src={`https://cloudflare-ipfs.com/ipfs/${
                    //   groupImageHash[parseInt(expense.groupId)]
                    // }`}
                    alt=""
                  />
                </div>
                <div className="ml-3">
                  <p className="text-lg font-bold text-gray-700 leading-none">
                    {expense.description}
                  </p>
                  <p className="mt-2 text-sm font-medium text-gray-500 leading-none">
                    Created By : {superShortenAddress(expense.requester)}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-900 font-bold">
                {parseInt(expense.amount)} DAI
              </div>
              {!transactionLoading ? (
                <button
                  type="submit"
                  onClick={() => handleSubmit(parseInt(expense.expenseIndex))}
                  className="rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 my-4"
                >
                  Pay Now
                </button>
              ) : (
                <button className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-300 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 my-4">
                  Loading, wait for the transaction to complete.
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const NestedLayout = ({ children }: Props) => {
  return <div style={{ height: "calc(100vh - 72px)" }}>{children}</div>;
};

export const GroupsPageLayout = (page: any) => (
  <NestedLayout>{page}</NestedLayout>
);

GroupPage.getLayout = GroupsPageLayout;

export default GroupPage;
