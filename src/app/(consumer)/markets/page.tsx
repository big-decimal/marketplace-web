import { parseErrorResponse, pluralize } from "@/common/utils";
import Alert from "@/components/Alert";
import { getMarkets } from "@/services/MarketService";
import Link from "next/link";
import { CSSProperties } from "react";

export default async function Markets() {
  try {
    const data = await getMarkets({});

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
                  <li className="breadcrumb-item active" aria-current="page">
                    Markets
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
        <div className="container py-3">
          <div className="row">
            <div className="col-12">
              {data.contents.length > 0 && (
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xxxl-4 g-4">
                  {data.contents.map((m, i) => {
                    return (
                      <Link
                        key={i}
                        className="col text-decoration-none"
                        href={`/markets/${m.slug}`}
                      >
                        <div className="card h-100">
                          <div className="card-body py-4">
                            <h5 className="text-center">{m.name}</h5>
                            <div className="text-muted text-center">
                              {pluralize(m.shopCount ?? 0, "shop")}
                            </div>

                            {/* {m.url && <a href={m.url} className="hstack justify-content-center mt-3" target="_blank">
                              <span>Website</span>
                              <RiExternalLinkLine size={16} className="ms-1" />
                            </a>} */}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
              {data.contents.length === 0 && (
                <Alert message="No markets found" />
              )}
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
