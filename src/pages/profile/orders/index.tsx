import Link from "next/link";
import { formatTimestamp } from "../../../common/utils";
import AccountMenu from "../../../components/account/AccountMenu";
import { Input, Select } from "../../../components/forms";
import Pagination from "../../../components/Pagination";

function OrderCard() {
  return (
    <div className="card mb-3">
      <div className="card-header py-3 bg-white">
        <div className="row">
          <div className="col d-flex">
            <span className="fw-semibold h5 my-auto">Order ID: 20001</span>
          </div>
          <div className="col-auto">
            <Link href={"/profile/orders/1"}>
              <a className="btn btn-sm btn-outline-primary">View Detail</a>
            </Link>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="row gx-2 gy-3">
          <div className="col-md-5 small">
            <h6 className="fw-bold">Deliver to</h6>
            <div>
              Name:<text className="text-muted ms-2">Mobile Com</text>
            </div>
            <div>
              Phone:<text className="text-muted ms-2">+95911223344</text>
            </div>
            <div>
              Address:
              <text className="text-muted ms-2">
                No. 26, Pyay Street, Hlaing Township, Yangon, Myanmar
              </text>
            </div>
            <div>
              Notes:
              <text className="text-muted ms-2">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.
              </text>
            </div>
          </div>
          <div className="col-md-4 small">
            <h6 className="fw-bold">Payment info</h6>
            <div>
              Total Products:<text className="text-muted ms-2">5</text>
            </div>
            <div>
              Subtotal:<text className="text-muted ms-2">30,000ks</text>
            </div>
            <div>
              Discounts:
              <text className="text-danger ms-2">-0ks</text>
            </div>
            <div>
              Total Price:
              <text className="text-success ms-2">33,000ks</text>
            </div>
          </div>
          <div className="col-md-3">
            <h6 className="fw-bold">Status</h6>
            <div className="text-success">
              <small className="fw-semibold">DELIVERED</small>
            </div>
          </div>
        </div>
      </div>
      <div className="card-footer small border-0 py-3 text-muted">
        {formatTimestamp(Date.now(), true)}
      </div>
    </div>
  );
}

function MyOrders() {
  const list = [1, 2];
  return (
    <div>
      <div className="bg-primary">
        <div className="container">
          <div className="py-4 py-lg-5">
            <h1 className="text-light text-center text-lg-start">My Orders</h1>
          </div>
        </div>
      </div>

      <div className="container py-4">
        <div className="row g-4">
          <div className="col-lg-4 col-xl-3">
            <AccountMenu />
          </div>
          <div className="col-lg-8 col-xl-9">
            <div className="card mb-3 p-3">
              <div className="row g-3">
                <div className="col">
                  <Input
                    id="searchinput"
                    name="search"
                    type="text"
                    placeholder="Search your orders"
                  />
                </div>
                <div className="col-auto">
                  <Select>
                    <option value="">All Status</option>
                    <option value="">Pending</option>
                    <option value="">Suspended</option>
                    <option value="">Deleted</option>
                  </Select>
                </div>
                <div className="col-auto">
                  <Link href="#">
                    <a className="ms-auto btn btn-primary h-100 hstack">
                      Search
                    </a>
                  </Link>
                </div>
              </div>
            </div>
            {list.map((i) => (
              <OrderCard key={i} />
            ))}
            <div className="d-flex justify-content-end">
              <Pagination />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyOrders;
