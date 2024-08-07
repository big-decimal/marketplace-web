"use client";
import { formControlHeight } from "@/common/app.config";
import { AuthenticationContext, ProgressContext } from "@/common/contexts";
import makeApiRequest from "@/common/make-api-request";
import { PageData, User } from "@/common/models";
import {
  buildQueryParams,
  debounce,
  formatTimestamp,
  parseErrorResponse,
  validateResponse
} from "@/common/utils";
import { withAuthorization } from "@/common/withAuthorization";
import Alert from "@/components/Alert";
import Dropdown from "@/components/Dropdown";
import Loading from "@/components/Loading";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import { verifyPhoneNumber } from "@/services/UserService";
import { RiPencilFill } from "@remixicon/react";
import { useContext, useState } from "react";
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

  const [inputType, setInputType] = useState("email");
  const [user, setUser] = useState<User>();
  const [isShowUpdatePhone, setShowUpdatePhone] = useState(false);
  const [isShowUpdatePassword, setShowUpdatePassword] = useState(false);

  const [query, setQuery] = useState<UserQuery>({});

  const { data, error, isLoading, mutate } = useSWR(
    ["/admin/users", query],
    ([url, q]) => getUsers(q),
    {
      revalidateOnFocus: false
    }
  );

  const updateInput = debounce((v) => {
    setQuery((old) => {
      return {
        name: old.name,
        page: undefined,
        [inputType]: !v ? undefined : v
      };
    });
  }, 800);

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

  const content = () => {
    if (isLoading) {
      return <Loading />;
    }

    if (error) {
      return <Alert message={parseErrorResponse(error)} variant="danger" />;
    }

    if (!data || data.totalElements === 0) {
      return <Alert message="No users found" variant="info" />;
    }

    return (
      <>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead className="text-nowrap align-middle">
              <tr>
                <th scope="col" style={{ minWidth: 300 }}>
                  NAME
                </th>
                {/* <th scope="col" style={{ minWidth: 200 }}>
                  EMAIL
                </th> */}
                <th scope="col" style={{ minWidth: 150 }}>
                  PHONE
                </th>
                <th scope="col" style={{ minWidth: 150 }}>
                  VERIFIED
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
              {data?.contents?.map((u, i) => (
                <tr key={u.id}>
                  <th scope="row" className="py-3">
                    {u.name}
                  </th>
                  {/* <td>
                    <span className="text-nowrap">{u.email ?? ""}</span>
                  </td> */}
                  <td>
                    <span className="text-nowrap">{u.phone ?? ""}</span>
                  </td>
                  <td>{u.phoneNumberVerified ? "YES" : "NO"}</td>
                  <td>
                    <span className="text-nowrap">{u.role}</span>
                  </td>
                  <td>{formatTimestamp(u.audit?.createdAt, true)}</td>
                  <td>
                    <div className="hstack align-items-center gap-2">
                      {u.id !== authContext.user?.id &&
                        authContext.user?.role === "OWNER" && (
                          <Dropdown
                            toggle={<RiPencilFill size={20} />}
                            popperConfig={{
                              strategy: "fixed"
                            }}
                            toggleClassName="btn btn-primary"
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
            currentPage={data?.currentPage}
            totalPage={data?.totalPage}
            onChange={(p) => {
              setQuery((old) => {
                return { ...old, page: p };
              });
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
          <div className="d-flex flex-nowrap">
            <div className="d-flex">
              <select
                className="form-select bg-light rounded-0 rounded-start border-end-0"
                value={inputType}
                onChange={(e) => {
                  setInputType(e.target.value);
                }}
              >
                <option value="email">Email</option>
                <option value="phone">Phone</option>
              </select>
            </div>
            <div className="position-relative">
              <input
                className="form-control rounded-0 rounded-end"
                type="search"
                placeholder={`By ${inputType}...`}
                aria-label="Search"
                onChange={(evt) => {
                  updateInput(evt.target.value);
                }}
                style={{
                  height: formControlHeight
                }}
              />
            </div>
          </div>
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
