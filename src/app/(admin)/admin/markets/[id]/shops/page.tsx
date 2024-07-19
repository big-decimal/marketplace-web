import { redirect } from "next/navigation";
import MarketShopsPage from "./market-shops-page";

export default async function MarketShops({
  params
}: {
  params: { id: string };
}) {
  var id = parseInt(params.id);
  if (isNaN(id)) {
    redirect("/admin/markets");
  }

  return <MarketShopsPage marketId={id} />;
}
