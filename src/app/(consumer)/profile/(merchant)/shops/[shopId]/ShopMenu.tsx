"use client";

import { AuthenticationContext } from "@/common/contexts";
import { Shop } from "@/common/models";
import Accordion from "@/components/Accordion";
import { PendingOrderCountView } from "@/components/shop";
import { getShopMember } from "@/services/ShopService";
import {
  RiBox3Line,
  RiComputerLine,
  RiDiscountPercentLine,
  RiErrorWarningFill,
  RiFileList3Line,
  RiGroupLine,
  RiMoneyDollarCircleLine,
  RiSettings3Line
} from "@remixicon/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useContext } from "react";
import useSWR from "swr";

const iconSize = 20;

export default function ShopMenu({ shop }: { shop: Shop }) {
  const pathname = usePathname();
  const { user } = useContext(AuthenticationContext);

  const { data } = useSWR(
    [`/vendor/shops/${shop.id}/members`, user?.id ?? 0],
    ([url, userId]) => getShopMember(shop.id, userId),
    {
      revalidateOnFocus: false
    }
  );

  const currentTime = new Date().getTime();

  function menuLink({
    path,
    title,
    icon,
    suffix
  }: {
    path: string;
    title: string;
    icon: ReactNode;
    suffix?: ReactNode;
  }) {
    const active = pathname === path;
    return (
      <Link
        href={path}
        className={`d-flex align-items-center p-2 my-list-item ${
          active ? "active" : ""
        }`}
      >
        {icon}
        <span>{title}</span>
        <div className="flex-grow-1"></div>
        {suffix}
      </Link>
    );
  }

  return (
    <div className="rounded border bg-white">
      <Accordion
        open={true}
        header={(open) => {
          return <span className="fw-bold">Menu</span>;
        }}
        headerClassName="px-3 py-2h border-bottom"
        bodyClassName=""
        iconType="plus-minus"
      >
        <div className="p-3">
          <div className="vstack gap-1">
            {menuLink({
              path: `/profile/shops/${shop.id}/dashboard`,
              title: "Dashboard",
              icon: <RiComputerLine className="me-2" size={iconSize} />
            })}
            {menuLink({
              path: `/profile/shops/${shop.id}/products`,
              title: "Products",
              icon: <RiBox3Line className="me-2" size={iconSize} />
            })}
            {menuLink({
              path: `/profile/shops/${shop.id}/discounts`,
              title: "Discount",
              icon: <RiDiscountPercentLine className="me-2" size={iconSize} />
            })}
            {menuLink({
              path: `/profile/shops/${shop.id}/orders`,
              title: "Orders",
              icon: <RiFileList3Line className="me-2" size={iconSize} />,
              suffix: (
                <>
                  <PendingOrderCountView shopId={shop.id ?? 0} />
                </>
              )
            })}
            {menuLink({
              path: `/profile/shops/${shop.id}/subscriptions`,
              title: "Subscriptions",
              icon: (
                <RiMoneyDollarCircleLine className="me-2" size={iconSize} />
              ),
              suffix: (
                <>
                  {(shop?.expiredAt ?? 0) <= currentTime && (
                    <RiErrorWarningFill
                      size={20}
                      className="text-warning ms-2"
                    />
                  )}
                </>
              )
            })}

            {data?.role === "OWNER" &&
              menuLink({
                path: `/profile/shops/${shop.id}/members`,
                title: "Members",
                icon: <RiGroupLine className="me-2" size={iconSize} />
              })}

            {menuLink({
              path: `/profile/shops/${shop.id}/setting`,
              title: "Setting",
              icon: <RiSettings3Line className="me-2" size={iconSize} />
            })}
          </div>
        </div>
      </Accordion>
    </div>
  );
}
