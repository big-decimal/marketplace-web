"use client";
import { ProgressContext } from "@/common/contexts";
import { useLocalization } from "@/common/hooks";
import makeApiRequest from "@/common/make-api-request";
import { Category } from "@/common/models";
import {
  formatTimestamp,
  getCategoryName,
  parseErrorResponse,
  validateResponse
} from "@/common/utils";
import Alert from "@/components/Alert";
import ConfirmModal from "@/components/ConfirmModal";
import Loading from "@/components/Loading";
import {
  RiArrowDownLine,
  RiArrowUpLine,
  RiDeleteBinLine,
  RiPencilFill
} from "@remixicon/react";
import Link from "next/link";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import useSWR from "swr";

const getCategories = async (categoryId: number) => {
  const url = `/admin/categories/${categoryId}/list`;
  const resp = await makeApiRequest({
    url,
    authenticated: true
  });
  await validateResponse(resp);
  return resp.json() as Promise<Category[]>;
};

const deleteCategory = async (id: number) => {
  const url = `/admin/categories/${id}`;
  const resp = await makeApiRequest({
    url,
    options: {
      method: "DELETE"
    },
    authenticated: true
  });

  await validateResponse(resp);
};

function CategoryList({
  categoryId,
  lang
}: {
  categoryId: number;
  lang: string;
}) {
  const [category, setCategory] = useState<Category>();
  const [showConfirm, setShowConfirm] = useState(false);
  const progressContext = useContext(ProgressContext);
  const { locale } = useLocalization();

  const [nameAscending, setNameAscending] = useState(true);

  const { data, error, isLoading, mutate } = useSWR(
    `/admin/categories/${categoryId}/list`,
    () => getCategories(categoryId),
    {
      revalidateOnFocus: false
    }
  );

  const content = () => {
    if (isLoading) {
      return <Loading />;
    }

    if (error) {
      return <Alert message={parseErrorResponse(error)} variant="danger" />;
    }

    if (!data || data.length === 0) {
      return <Alert message="No categories found" variant="info" />;
    }

    return (
      <>
        <div className="table-responsive py-1 scrollbar-custom">
          <table className="table align-middle">
            <thead className="text-nowrap align-middle">
              <tr>
                <th scope="col" style={{ minWidth: 400 }}>
                  <div className="hstack gap-2">
                    NAME
                    <div
                      role="button"
                      className="text-primary"
                      onClick={() => setNameAscending((old) => !old)}
                    >
                      {nameAscending ? (
                        <RiArrowUpLine size={20} />
                      ) : (
                        <RiArrowDownLine size={20} />
                      )}
                    </div>
                  </div>
                </th>
                <th scope="col" style={{ minWidth: 250, width: 250 }}>
                  CREATED AT
                </th>
                <th scope="col" style={{ minWidth: 200, width: 200 }}>
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody>
              {data
                ?.sort((a, b) => {
                  const nameA = getCategoryName(locale, a);
                  const nameB = getCategoryName(locale, b);

                  if (nameAscending) {
                    return nameA.localeCompare(nameB);
                  }

                  return nameB.localeCompare(nameA);
                })
                .map((c, i) => {
                  return (
                    <tr key={c.id}>
                      <th scope="row" className="py-3">
                        <Link
                          href={`/admin/categories/${c.id}/list`}
                          className="link-dark"
                        >
                          {getCategoryName(lang, c)}
                        </Link>
                      </th>
                      <td>
                        <span className="text-nowrap">
                          {formatTimestamp(c.audit?.createdAt, true)}
                        </span>
                      </td>
                      <td>
                        <div className="hstack align-items-center gap-2">
                          <Link
                            href={`/admin/categories/${c.id}`}
                            className="btn btn-default"
                          >
                            <RiPencilFill size={20} />
                          </Link>
                          <button
                            disabled={false}
                            className="btn btn-danger"
                            onClick={() => {
                              setCategory(c);
                              setShowConfirm(true);
                            }}
                          >
                            <RiDeleteBinLine size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </>
    );
  };

  return (
    <>
      {/* <div className="row mb-4 g-3">
        <div className="col-auto me-auto">
          <h2 className="mb-0">Categories</h2>
        </div>

        <div className="col-auto hstack gap-3">
          <Select
            value={lang}
            onChange={(evt) => {
              setLang(evt.target.value);
            }}
          >
            <option value="en">English</option>
            <option value="mm">Myanmar</option>
          </Select>

          <Link
            href="/admin/categories/create-category"
            className="btn btn-primary align-self-center text-nowrap"
          >
            Add new
          </Link>
        </div>
      </div> */}

      {content()}
      <ConfirmModal
        show={showConfirm}
        message="Are you sure to delete?"
        onConfirm={async (result) => {
          try {
            if (!result) {
              return;
            }
            progressContext.update(true);
            category?.id && (await deleteCategory(category.id));
            mutate();
          } catch (error) {
            const msg = parseErrorResponse(error);
            toast.error("Delete failed");
          } finally {
            setCategory(undefined);
            progressContext.update(false);
          }
        }}
        close={() => {
          setShowConfirm(false);
        }}
      />
    </>
  );
}

export default CategoryList;
