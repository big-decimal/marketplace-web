"use client";
import { AuthenticationContext, ProgressContext } from "@/common/contexts";
import makeApiRequest from "@/common/make-api-request";
import { PageData, User } from "@/common/models";
import {
  buildQueryParams,
  formatTimestamp,
  parseErrorResponse,
  validateResponse
} from "@/common/utils";
import { hasAccess, withAuthorization } from "@/common/withAuthorization";
import Alert from "@/components/Alert";
import Dropdown from "@/components/Dropdown";
import Loading from "@/components/Loading";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import { Input } from "@/components/forms";
import {
  disableUser,
  enableUser,
  verifyPhoneNumber
} from "@/services/UserService";
import { RiPencilFill } from "@remixicon/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";
import UpdatePassword from "./update-password";
import UpdatePhoneNumber from "./update-phone-number";

export interface UserQuery {
  name?: string;
  phone?: string;
  email?: string;
  page?: number;
}

const getUsers = async (query: UserQuery) => {
  const q = buildQueryParams({ ...query });
  const url = `/admin/users${q}`;
  const resp = await makeApiRequest({ url, authenticated: true });
  await validateResponse(resp);
  return resp.json() as Promise<PageData<User>>;
};

const grantAdmin = async (userId: number) => {
  const url = `/admin/users/${userId}/grant-admin`;
  const resp = await makeApiRequest({
    url,
    options: { method: "PUT" },
    authenticated: true
  });
  await validateResponse(resp);
};

const dismissAdmin = async (userId: number) => {
  const url = `/admin/staff-users/${userId}/dismiss-admin`;
  const resp = await makeApiRequest({
    url,
    options: { method: "PUT" },
    authenticated: true
  });
  await validateResponse(resp);
};

function UsersPage() {
  const authContext = useContext(AuthenticationContext);
  const progressContext = useContext(ProgressContext);
  const searchParams = useSearchParams();
  const router = useRouter();

  const [user, setUser] = useState<User>();
  const [isShowUpdatePhone, setShowUpdatePhone] = useState(false);
  const [isShowUpdatePassword, setShowUpdatePassword] = useState(false);

  const phoneInputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState<UserQuery>();

  useEffect(() => {
    const page = searchParams.get("page");
    const phone = searchParams.get("phone");
    setQuery({
      phone: phone ?? undefined,
      page: page && !isNaN(parseInt(page)) ? parseInt(page) : undefined
    });
  }, [searchParams]);

  const { write } = useMemo(() => {
    return {
      write: hasAccess(["USER_WRITE"], authContext.user)
    };
  }, [authContext.user]);

  const { data, error, isLoading, mutate } = useSWR(
    ["/admin/users", query],
    ([url, q]) => (q ? getUsers(q) : undefined),
    {
      revalidateOnFocus: false
    }
  );

  const verifyPhone = async (userId: number) => {
    try {
      progressContext.update(true);
      await verifyPhoneNumber(userId);
      mutate();
    } catch (error) {
      toast.error(parseErrorResponse(error));
    } finally {
      progressContext.update(false);
    }
  };

  const enableOrDisableUser = async (userId: number, enable: boolean) => {
    try {
      progressContext.update(true);
      if (enable) {
        await enableUser(userId);
      } else {
        await disableUser(userId);
      }
      mutate();
    } catch (error) {
      toast.error(parseErrorResponse(error));
    } finally {
      progressContext.update(false);
    }
  };

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
                <th scope="col" style={{ minWidth: 120 }}>
                  VERIFIED
                </th>
                <th scope="col" style={{ minWidth: 120 }}>
                  DISABLED
                </th>
                <th scope="col" style={{ minWidth: 100 }}>
                  ROLE
                </th>
                <th scope="col" style={{ minWidth: 200 }}>
                  CREATED AT
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
                  <td>
                    <span className="text-nowrap">{u.phone ?? ""}</span>
                  </td>
                  <td>{u.phoneNumberVerified ? "YES" : "NO"}</td>
                  <td>{u.disabled ? "YES" : "NO"}</td>
                  <td>
                    <span className="text-nowrap">{u.role}</span>
                  </td>
                  <td>{formatTimestamp(u.audit?.createdAt, true)}</td>
                  <td>
                    <div className="hstack align-items-center gap-2">
                      {u.id !== authContext.user?.id && write && (
                        <Dropdown
                          toggle={<RiPencilFill size={20} />}
                          popperConfig={{
                            strategy: "fixed"
                          }}
                          toggleClassName="btn btn-default"
                          menuClassName="dropdown-menu-end"
                        >
                          <li
                            role={"button"}
                            className="dropdown-item"
                            onClick={() => {
                              setUser(u);
                              setShowUpdatePhone(true);
                            }}
                          >
                            Update phone
                          </li>
                          <li
                            role={"button"}
                            className="dropdown-item"
                            onClick={() => {
                              setUser(u);
                              setShowUpdatePassword(true);
                            }}
                          >
                            Update password
                          </li>
                          {!u.phoneNumberVerified && (
                            <li
                              role={"button"}
                              className="dropdown-item"
                              onClick={() => {
                                verifyPhone(u.id);
                              }}
                            >
                              Verify phone
                            </li>
                          )}
                          <li
                            role={"button"}
                            className="dropdown-item"
                            onClick={async () => {
                              await enableOrDisableUser(u.id, !!u.disabled);
                            }}
                          >
                            {u.disabled ? "Enable user" : "Disable user"}
                          </li>
                          {authContext.user?.role === "OWNER" && (
                            <>
                              <div className="dropdown-divider"></div>
                              {u.role === "USER" ? (
                                <li
                                  role={"button"}
                                  className="dropdown-item"
                                  onClick={() => {
                                    progressContext.update(true);
                                    grantAdmin(u.id)
                                      .then(() => {
                                        toast.success("User granted");
                                        mutate();
                                      })
                                      .catch((e) => {
                                        toast.error(parseErrorResponse(e));
                                      })
                                      .finally(() => {
                                        progressContext.update(false);
                                      });
                                  }}
                                >
                                  Grant Admin
                                </li>
                              ) : (
                                <li
                                  role={"button"}
                                  className="dropdown-item text-danger"
                                  onClick={() => {
                                    progressContext.update(true);
                                    dismissAdmin(u.id)
                                      .then(() => {
                                        toast.success("User dismissed");
                                        mutate();
                                      })
                                      .catch((e) => {
                                        toast.error(parseErrorResponse(e));
                                      })
                                      .finally(() => {
                                        progressContext.update(false);
                                      });
                                  }}
                                >
                                  Dismiss Admin
                                </li>
                              )}
                            </>
                          )}
                        </Dropdown>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-end pt-3">
          <Pagination
            currentPage={data.currentPage}
            totalPage={data.totalPage}
            onChange={(p) => {
              const params = new URLSearchParams(searchParams.toString());

              if (p > 0) {
                params.set("page", p.toString());
              } else {
                params.delete("page");
              }

              if (params.size > 0) {
                router.push("/admin/users?" + params.toString());
              } else {
                router.push("/admin/users");
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
        <div className="col-12 col-md">
          <h2 className="mb-0">Users</h2>
        </div>
        <div className="col-12 col-md-auto">
          <form
            onSubmit={(evt) => {
              evt.preventDefault();
              const params = new URLSearchParams(searchParams.toString());
              const phone = phoneInputRef.current?.value;

              if (phone) {
                params.set("phone", phone);
              } else {
                params.delete("phone");
              }

              params.delete('page');

              if (params.size > 0) {
                router.push("/admin/users?" + params.toString());
              } else {
                router.push("/admin/users");
              }
            }}
          >
            <Input
              ref={phoneInputRef}
              defaultValue={searchParams.get("phone") ?? ""}
              type="search"
              placeholder={`By phone...`}
              aria-label="Search"
            />
          </form>
        </div>
      </div>
      {content()}

      <Modal
        show={isShowUpdatePhone}
        onHidden={() => {
          setUser(undefined);
        }}
      >
        {(isShown) => {
          if (!isShown || !user) {
            return <></>;
          }

          return (
            <UpdatePhoneNumber
              user={user}
              onSuccess={mutate}
              close={() => {
                setShowUpdatePhone(false);
              }}
            />
          );
        }}
      </Modal>

      <Modal
        show={isShowUpdatePassword}
        onHidden={() => {
          setUser(undefined);
        }}
      >
        {(isShown) => {
          if (!isShown || !user) {
            return <></>;
          }

          return (
            <UpdatePassword
              user={user}
              close={() => setShowUpdatePassword(false)}
              onSuccess={mutate}
            />
          );
        }}
      </Modal>
    </>
  );
}

export default withAuthorization(UsersPage, ["USER_READ", "USER_WRITE"]);
