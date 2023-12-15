import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useAccount, useConnect } from "wagmi";
import { useRouter } from "next/router";
import axios from "axios";
import { superShortenAddress } from "@/utilities/shortenAddress";
import { InjectedConnector } from "wagmi/connectors/injected";
import { hexToNumber } from "viem";

export default function Index() {
  const router = useRouter();
  const { address } = useAccount();
  const [groups, setGroups] = useState<any>();
  const [groupDataLoading, setGroupDataLoading] = useState<boolean>(true);

  // Get expenses from the graph
  useEffect(() => {
    if (router.isReady && address) {
      fetch(`/api/groups?address=${address}`)
        .then((res) => res.json())
        .then((data) => {
          console.log(data.groups);
          setGroups(data.groups);
          setGroupDataLoading(false);
        });
    }
  }, [router.isReady, address]);

  return (
    <>
      <Head>
        <title>SplitMonies</title>
        <meta name="title" content="SplitMonies" />
      </Head>
      <div className="my-5 text-2xl font-black">Groups</div>
      {/* Groups start */}
      {!groupDataLoading && (
        <div>
          <div className="mt-3 divide-y divide-gray-200">
            {groups?.map((group: any, index: number) => (
              <div
                key={index}
                className="py-3.5 flex items-center justify-between"
              >
                <Link
                  href={`/group/${parseInt(hexToNumber(group.args[0]._hex))}`}
                  className="flex"
                >
                  <div className="shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="inline-block h-14 w-14 rounded-full ring-2 ring-gray-300"
                      // src={`https://cloudflare-ipfs.com/ipfs/${group.groupImage}`}
                      src={`https://gateway.lighthouse.storage/ipfs/${group.args[5]}`}
                      alt=""
                    />
                  </div>
                  <div className="ml-5">
                    <p className="text-xl font-bold text-gray-900">
                      {group.args[3]}
                    </p>
                    <p className="text-base font-medium text-gray-500 line-clamp-2">
                      {group.args[4]}
                    </p>
                    <div className="mt-3 flex items-center gap-x-1">
                      {/* Map and dispay the members in the group */}
                      {group.args[2].map((member: any, index: number) => (
                        <div
                          key={index}
                          className="bg-white border boder-gray-200 rounded-lg px-2 py-1 text-sm"
                        >
                          {superShortenAddress(member)}
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
                {/* <div className="text-sm text-gray-200 font-bold">
              {group.amount} ETH
            </div> */}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Groups end */}
    </>
  );
}
