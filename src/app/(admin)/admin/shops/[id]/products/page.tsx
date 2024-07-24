import { redirect } from "next/navigation";
import ShopProductsPage from "./shop-products-page";

export default function ShopProducts({ params }: { params: { id: string } }) {
  var id = parseInt(params.id);
  if (isNaN(id)) {
    redirect("/admin/shops");
  }
  return <ShopProductsPage shopId={id} />;
}
