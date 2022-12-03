import {
  ChartBarIcon,
  CubeIcon,
  MapPinIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useState } from "react";
import Dropdown from "../../../../components/Dropdown";
import BranchListing from "../../../../components/merchant/BranchListing";
import Dashboard from "../../../../components/merchant/Dashboard";
import DiscountListing from "../../../../components/merchant/DiscountListing";
import ProductListing from "../../../../components/merchant/ProductListing";

type PageTab = "dashboard" | "products" | "discounts" | "branches";

function ShopDetail() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<PageTab>("dashboard");

  const iconSize = 20;

  let image = `https://source.unsplash.com/random/200x240?random=${Math.floor(
    Math.random() * 100
  )}`;

  useEffect(() => {
    if (router.isReady) {
      const array = router.asPath.split("#");
      const tab = array[array.length - 1];
      console.log(tab);
      setActiveTab(tab as PageTab);
    }
  }, [router]);

  function menuLink({
    href,
    title,
    icon,
  }: {
    href: string;
    title: string;
    icon: ReactNode;
  }) {
    const active = router.asPath === href;
    return (
      <Link href={href} replace>
        <a
          className={`d-flex align-items-center p-2 my-list-item ${
            active ? "active" : ""
          }`}
        >
          {icon}
          <span>{title}</span>
        </a>
      </Link>
    );
  }

  const menus = (
    <>
      <div className="vstack gap-1">
        {menuLink({
          href: "/profile/shops/id#dashboard",
          title: "Dashboard",
          icon: (
            <ChartBarIcon className="me-2" strokeWidth={2} width={iconSize} />
          ),
        })}
        {menuLink({
          href: "/profile/shops/id#products",
          title: "Products",
          icon: <CubeIcon className="me-2" strokeWidth={2} width={iconSize} />,
        })}
        {menuLink({
          href: "/profile/shops/id#discounts",
          title: "Discounts",
          icon: <TagIcon className="me-2" strokeWidth={2} width={iconSize} />,
        })}
        {menuLink({
          href: "/profile/shops/id#branches",
          title: "Branches",
          icon: (
            <MapPinIcon className="me-2" strokeWidth={2} width={iconSize} />
          ),
        })}
      </div>
    </>
  );

  const activeContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "products":
        return <ProductListing />;
      case "discounts":
        return <DiscountListing />;
      case "branches":
        return <BranchListing />;
    }
  };

  return (
    <div>
      <div className="bg-primary">
        <div className="container py-4">
          <div className="hstack">
            <div>
              <div className="px-2">
                <h3 className="text-light text-lg-start">Shop Overview</h3>
              </div>
              <div className="row px-2">
                <nav aria-label="breadcrumb col-12">
                  <ol className="breadcrumb mb-1">
                    <li className="breadcrumb-item">
                      <Link href="/profile/shops">
                        <a href="#" className="text-light">
                          Shops
                        </a>
                      </Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Shoes World
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container py-4">
        <div className="row">
          <div className="col-12">
            <div className="border rounded bg-white vstack">
              <div
                style={{
                  width: "100%",
                  height: 200,
                }}
                className="position-relative"
              >
                <Image
                  src={image}
                  alt=""
                  layout="fill"
                  objectFit="cover"
                  priority
                />
              </div>
              <div className="row p-3 py-sm-4 position-relative">
                <div className="col">
                  <div className="hstack flex-wrap gap-2">
                    <div className="flex-shrink-0 mt-n9">
                      <Image
                        src={image}
                        width={100}
                        height={100}
                        alt=""
                        className="border rounded border-white border-4"
                        objectFit="cover"
                      />
                    </div>
                    <div className="ms-2 d-flex flex-column mt-n2 mt-sm-n3">
                      <h4 className="mb-0">{"Shoes World"}</h4>
                      <div className="text-muted small mb-1">
                        {"Shop HeadLine"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-sm-auto">
                  <div
                    className="mt-2 mt-sm-0 gap-1 hstack"
                    style={{ zIndex: 999 }}
                  >
                    <div className="flex-grow-1 d-none d-md-block"></div>
                    <Dropdown
                      toggle={
                        <button className="btn btn-outline-light text-muted dropdown-toggle">
                          Shop Action
                        </button>
                      }
                      menuClassName="dropdown-menu-end"
                    >
                      <li
                        role="button"
                        className="dropdown-item"
                        onClick={() => {
                          router.replace("/profile/shops/1#dashboard");
                        }}
                      >
                        Edit
                      </li>
                      <li
                        role="button"
                        className="dropdown-item"
                        onClick={() => {
                          router.replace("/profile/shops/1#products");
                        }}
                      >
                        Delete
                      </li>
                    </Dropdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row py-4 g-4">
          <div className="col-lg-3">
            <>
              <div className="card d-none d-lg-block">
                <div className="card-body">{menus}</div>
              </div>
              <div className="accordion border rounded d-block d-lg-none">
                <div className="accordion-item">
                  <div className="accordion-header">
                    <button
                      className="accordion-button fw-bold collapsed"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseMenu"
                      aria-expanded="false"
                      aria-controls="collapseMenu"
                    >
                      Menu
                    </button>
                  </div>

                  <div
                    id="collapseMenu"
                    className="accordion-collapse collapse border-top"
                  >
                    <div className="accordion-body p-3">{menus}</div>
                  </div>
                </div>
              </div>
            </>
          </div>
          <div className="col-lg-9">{activeContent()}</div>
        </div>
      </div>
    </div>
  );
}

export default ShopDetail;
