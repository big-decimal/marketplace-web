import Link from "next/link";
import { useRouter } from "next/router";
import useSWR from "swr";
import { PageData, Shop } from "../../../common/models";
import { withAuthentication } from "../../../common/WithAuthentication";
import AccountMenu from "../../../components/account/AccountMenu";
import Loading from "../../../components/Loading";
import Pagination from "../../../components/Pagination";
import { ShopManageGridItem } from "../../../components/shop";
import { getMyShops } from "../../../services/ShopService";

function MyShops() {
  const router = useRouter();

  const { page } = router.query;

  const { data, error, isLoading, isValidating } = useSWR<
    PageData<Shop>,
    Error
  >(["/my-shops", page], ([url, p]) => getMyShops(p), {
    revalidateOnFocus: false
  });

  const content = () => {
    if (isLoading || isValidating) {
      return <Loading />;
    }

    if (error) {
    }

    if (data?.contents.length === 0) {
      return <div className="text-center text-muted p-3">No shops found</div>;
    }

    return (
      <>
        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-3">
          {data?.contents &&
            data.contents.map((s, i) => {
              return (
                <div className="col" key={s.id}>
                  <ShopManageGridItem value={s} />
                </div>
              );
            })}
        </div>

        <div className="d-flex justify-content-end pt-3">
          <Pagination
            currentPage={data?.currentPage}
            totalPage={data?.totalPage}
            onChange={(p) => {
              router.push({
                pathname: "/profile/shops",
                query: { page: p }
              });
            }}
          />
        </div>
      </>
    );
  };

  return (
    <div>
      <div className="bg-primary">
        <div className="container">
          <div className="py-4">
            <h1 className="text-light text-center text-lg-start">My Shops</h1>
          </div>
        </div>
      </div>

      <div className="container py-4">
        <div className="row g-3">
          <div className="col-lg-4 col-xl-3">
            <AccountMenu />
          </div>
          <div className="col-lg-8 col-xl-9">
            <div className="card shadow-sm">
              <div className="card-header bg-white border-bottom">
                <div className="py-2">
                  <div className="row g-3">
                    <div className="col">
                      {/* <Input
                        id="searchinput"
                        name="search"
                        type="text"
                        placeholder="Search your shops"
                      /> */}
                    </div>
                    {/* <div className="col-auto d-none d-sm-block">
                      <Select>
                        <option value="">All Status</option>
                        <option value="">Pending</option>
                        <option value="">Suspended</option>
                        <option value="">Deleted</option>
                      </Select>
                    </div> */}
                    <div className="col-auto d-none d-sm-block">
                      <Link href="/profile/shops/create">
                        <a className="ms-auto btn btn-primary h-100 hstack py-2h">
                          Create new
                        </a>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-body">{content()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuthentication(MyShops);
