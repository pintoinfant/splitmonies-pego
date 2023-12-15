import { db } from "@/utilities/mongo";
import { numberToHex } from "viem";

export default async function read(req: any, res: any) {
  if (req.method === "GET") {
    let groupId = req.query.groupId;
    let hexNumber =parseInt(groupId).toString(16)
    // console.log();
    // let hexNumber = numberToHex(parseInt(groupId));
    // console.log("hexNumber", hexNumber);
    // console.log("userAddress", userAddress);
    const paidSplits = await db
      .collection("events")
      .aggregate(
        [
          { $match: { event: "ExpenseAdded" } },
          {
            $match: {
              "args.0": {
                _hex: `0x0${hexNumber}`,
                _isBigNumber: true,
              },
            },
          },
        ],
        { maxTimeMS: 60000, allowDiskUse: true }
      )
      .toArray();
    // .findOne(where);

    res.status(200).json({ success: true, paidSplits });
  } else {
    // Handle any other HTTP method
  }
}
