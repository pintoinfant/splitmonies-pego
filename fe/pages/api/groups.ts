import { db } from "@/utilities/mongo";

export default async function read(req: any, res: any) {
  if (req.method === "GET") {
    let userAddress = req.query.address;
    console.log("userAddress", userAddress);
    const groups = await db
      .collection("events")
      .aggregate(
        [
          {
            $match: {
              event: "GroupCreated",
            },
          },
          {
            $match: {
              $or: [
                { "args.1": userAddress },
                { "args.2": { $elemMatch: { $eq: userAddress } } },
              ],
            },
          },
        ],
        { maxTimeMS: 60000, allowDiskUse: true }
      )
      .toArray();

    // .findOne(where);

    res.status(200).json({ success: true, groups });
  } else {
    // Handle any other HTTP method
  }
}
