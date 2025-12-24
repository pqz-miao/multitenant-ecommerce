import { getPayload } from "payload";

import comfigPromise from "@payload-config";

const Page = async () => {
  const payload = await getPayload({
    config: comfigPromise,
  });

  const data = await payload.find({
    collection: "users",
  });

  return (
    <div className="p-4">
      {JSON.stringify(data, null, 2)}
    </div>
  );
};

export default Page;
