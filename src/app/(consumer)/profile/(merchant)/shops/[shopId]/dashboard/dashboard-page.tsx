"use client";
import { formatNumber, parseErrorResponse } from "@/common/utils";
import { getShopStatistic } from "@/services/ShopService";
import {
  RiBox3Fill,
  RiFileTextFill,
  RiShoppingBagFill
} from "@remixicon/react";
import useSWR from "swr";
import SaleLineChart from "./SaleLineChart";
import Alert from "@/components/Alert";

function ShopDashboard({ shopId }: { shopId: number }) {
  const iconSize = 56;
  const { data, error, isLoading } = useSWR(
    `/shops/${shopId}/statistic`,
    () => getShopStatistic(shopId),
    {
      revalidateOnFocus: false
    }
  );

  if (error) {
    return <Alert message={parseErrorResponse(error)} variant="danger" />;
  }

  return (
    <div>
      <div className="row g-3 mb-3">
        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <div className="hstack gap-3">
                <div className="bg-success text-light rounded">
                  <RiShoppingBagFill
                    size={iconSize}
                    className="flex-shrink-0 p-2"
                  />
                </div>

                <div className="vstack gap-1 text-nowrap">
                  <h6 className="text-muted mb-auto">Total Sales</h6>
                  <span className="fw-semibold">
                    {formatNumber(data?.totalSale ?? 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <div className="hstack gap-3">
                <div className="bg-primary text-light rounded">
                  <RiFileTextFill
                    size={iconSize}
                    className="flex-shrink-0 p-2"
                  />
                </div>
                <div className="vstack gap-1 text-nowrap">
                  <h6 className="text-muted mb-auto">Total Orders</h6>
                  <span className="fw-semibold">
                    {formatNumber(data?.totalOrder ?? 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="card">
            <div className="card-body">
              <div className="hstack gap-3">
                <div className="bg-default text-dark rounded">
                  <RiBox3Fill size={iconSize} className="flex-shrink-0 p-2" />
                </div>
                <div className="vstack gap-1 text-nowrap">
                  <h6 className="text-muted mb-auto">Total Products</h6>
                  <span className="fw-semibold">
                    {formatNumber(data?.totalProduct ?? 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <SaleLineChart shopId={shopId} />
        </div>
      </div>
    </div>
  );
}

export default ShopDashboard;
