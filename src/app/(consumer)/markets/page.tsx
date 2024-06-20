import { parseErrorResponse, pluralize } from "@/common/utils";
import Alert from "@/components/Alert";
import { getMarkets } from "@/services/MarketService";
import Link from "next/link";
import { CSSProperties } from "react";

export default async function Markets() {
  try {
    const data = await getMarkets({});

    return (
      <>
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
                  <li className="breadcrumb-item active" aria-current="page">
                    Markets
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
        <div className="container py-3 mb-5">
          <div className="row">
            <div className="col-12">
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xxxl-4 g-4">
                {data.contents.map((m, i) => {
                  return (
                    <a
                      key={i}
                      className="col text-decoration-none"
                      href={m.url ? m.url : undefined}
                      target="_blank"
                    >
                      <div className="card h-100">
                        <div className="card-body py-4">
                          <h5 className="text-center">{m.name}</h5>
                          <div className="text-muted text-center">
                            {pluralize(m.shopCount ?? 0, "shop")}
                          </div>
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
              {data.contents.length === 0 && (
                <Alert message="No markets found" />
              )}
            </div>
          </div>
        </div>
      </>
    );
  } catch (error) {
    return (
      <div className="container py-3">
        <Alert message={parseErrorResponse(error)} variant="danger" />
      </div>
    );
  }
}
