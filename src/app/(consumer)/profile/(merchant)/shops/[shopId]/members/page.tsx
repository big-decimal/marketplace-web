import ShopMembersPage from "./shop-members-page";

export default function ShopMembers({
  params
}: {
  params: { shopId: string };
}) {
  return <ShopMembersPage shopId={parseInt(params.shopId)} />;
}
