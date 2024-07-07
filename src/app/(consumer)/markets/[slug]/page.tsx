import { parseErrorResponse } from "@/common/utils";
import Alert from "@/components/Alert";
import { getMarket } from "@/services/MarketService";
import Link from "next/link";
import { CSSProperties } from "react";
import MarketShopsPage from "./market-shops-page";
import { ShopQuery } from "@/services/ShopService";

interface Props {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function Market({ params, searchParams }: Props) {
  try {
    const data = await getMarket(params.slug);

    if (!data) {
      throw "Market not found";
    }

    const { page } = searchParams;

    const query = {
      "market-id": data.id,
      page: typeof page === "string" ? parseInt(page) : undefined
    } as ShopQuery;

    return (
      <div className="mb-5">
        <div className="header-bar">
          <div className="container">
            <div className="row py-4 px-2">
              <nav aria-label="breadcrumb col-12">
                <ol
                  className="breadcrumb mb-1"
                  style={
                    {
                      "--bs-breadcrumb-divider-color": "#bbb",
                      "--bs-breadcrumb-item-active-color": "#bbb"
                    } as CSSProperties
                  }
                >
                  <li className="breadcrumb-item">
                    <Link href="/" className="">
                      Home
                    </Link>
                  </li>
                  <li className="breadcrumb-item">
                    <Link href="/markets" className="">
                      Markets
                    </Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    {data.name}
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
        <div className="container py-3">
          <div className="row">
            <div className="col-12">
              <MarketShopsPage query={query} />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="container py-3">
        <Alert message={parseErrorResponse(error)} variant="danger" />
      </div>
    );
  }
}
