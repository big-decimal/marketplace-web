"use client";
import { AuthenticationContext, ProgressContext } from "@/common/contexts";
import makeApiRequest from "@/common/make-api-request";
import { PageData, User } from "@/common/models";
import {
  buildQueryParams,
  parseErrorResponse,
  validateResponse
} from "@/common/utils";
import { withAuthorization } from "@/common/withAuthorization";
import Alert from "@/components/Alert";
import ConfirmModal from "@/components/ConfirmModal";
import Loading from "@/components/Loading";
import Pagination from "@/components/Pagination";
import { RiDeleteBinLine, RiPencilFill } from "@remixicon/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";

export interface UserQuery {
  name?: string;
  phone?: string;
  email?: string;
  "staff-only"?: boolean;
  page?: number;
}

const getUsers = async (query: UserQuery) => {
  const q = buildQueryParams({ ...query });
  const url = `/admin/users${q}`;
  const resp = await makeApiRequest({ url, authenticated: true });
  await validateResponse(resp);
  return resp.json() as Promise<PageData<User>>;
};

const removeStaffUser = async (userId: number) => {
  const url = `/admin/staff-users/${userId}/dismiss-admin`;
  const resp = await makeApiRequest({
    url,
    options: { method: "PUT" },
    authenticated: true
  });
  await validateResponse(resp);
};

function StaffUsersPage() {
  const { user } = useContext(AuthenticationContext);
  const progressContext = useContext(ProgressContext);
  const searchParams = useSearchParams();
  const router = useRouter();

  const { write } = useMemo(() => {
    return {
      write: user?.role === "OWNER"
    };
  }, [user]);

  const [showRemoveConfrim, setShowRemoveConfirm] = useState(false);

  const [staff, setStaff] = useState<User>();

  const [query, setQuery] = useState<UserQuery>();

  const { data, error, isLoading, mutate } = useSWR(
    ["/admin/staff-users", query],
    ([url, q]) => q ? getUsers(q) : undefined,
    {
      revalidateOnFocus: false
    }
  );

  useEffect(() => {
    const page = searchParams.get("page");
    setQuery({
      "staff-only": true,
      page: page && !isNaN(parseInt(page)) ? parseInt(page) : undefined
    });
  }, [searchParams]);

  const content = () => {
    if (error) {
      return <Alert message={parseErrorResponse(error)} variant="danger" />;
    }

    if (!data || isLoading) {
      return <Loading />;
    }

    if (data.totalElements === 0) {
      return <Alert message="No users found" variant="info" />;
    }

    return (
      <>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="text-nowrap align-middle">
              <tr>
                <th scope="col" style={{ minWidth: 50 }}>
                  NO.
                </th>
                <th scope="col" style={{ minWidth: 300 }}>
                  NAME
                </th>
                <th scope="col" style={{ minWidth: 150 }}>
                  PHONE
                </th>
                <th scope="col" style={{ minWidth: 100 }}>
                  ROLE
                </th>
                <th scope="col" style={{ minWidth: 150 }}>
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {data.contents.map((u, i) => (
                <tr key={u.id}>
                  <td>{(i + 1) * (data.currentPage + 1)}</td>
                  <th scope="row" className="py-3">
                    {u.name}
                  </th>
                  <td>{u.phone ?? ""}</td>
                  <td>{u.role}</td>
                  <td>
                    {write && u.id !== user?.id && u.role !== "OWNER" && (
                      <div className="hstack gap-2">
                        <Link
                          href={`/admin/settings/staff-users/${u.id}`}
                          className="btn btn-default"
                        >
                          <RiPencilFill size={20} />
                        </Link>
                        <div
                          role={"button"}
                          className="btn btn-danger"
                          onClick={() => {
                            setStaff(u);
                            setShowRemoveConfirm(true);
                          }}
                        >
                          <RiDeleteBinLine size={20} />
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-end pt-3 mb-5">
          <Pagination
            currentPage={data?.currentPage}
            totalPage={data?.totalPage}
            onChange={(p) => {
              const params = new URLSearchParams(searchParams.toString());

              if (p > 0) {
                params.set("page", p.toString());
              } else {
                params.delete("page");
              }

              if (params.size > 0) {
                router.push("/admin/settings/staff-users?" + params.toString());
              } else {
                router.push("/admin/settings/staff-users");
              }
            }}
          />
        </div>
      </>
    );
  };

  return (
    <>
      <div className="row mb-4 g-3">
        <div className="col-auto me-auto">
          <h3 className="fw-semibold mb-1">Staff Users</h3>
          <nav aria-label="breadcrumb col-12">
            <ol className="breadcrumb mb-1">
              <li className="breadcrumb-item">
                <Link href="/admin/settings" className="link-anchor">
                  Settings
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Staffs
              </li>
            </ol>
          </nav>
        </div>
      </div>
      {content()}

      <ConfirmModal
        show={showRemoveConfrim}
        message={`Are you sure to remove user: ${staff?.name}?`}
        close={() => {
          setShowRemoveConfirm(false);
        }}
        onConfirm={async (result) => {
          try {
            if (!result) {
              return;
            }
            if (!staff) {
              throw "Unauthorized";
            }
            progressContext.update(true);
            await removeStaffUser(staff.id);
            mutate();
            toast.success("Staff user removed");
          } catch (error) {
            const msg = parseErrorResponse(error);
            toast.error(msg);
          } finally {
            setStaff(undefined);
            progressContext.update(false);
          }
        }}
      />
    </>
  );
}

export default withAuthorization(StaffUsersPage, []);
