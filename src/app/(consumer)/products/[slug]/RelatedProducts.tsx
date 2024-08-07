"use client";
import useSWR from "swr";
import { parseErrorResponse } from "@/common/utils";
import { getRelatedProducts } from "@/services/ProductService";
import { ProductGridItem } from "@/components/product";
import Alert from "@/components/Alert";
import Loading from "@/components/Loading";

interface RelatedProductsProps {
  productId: number;
  categoryId?: number;
}

function RelatedProducts(props: RelatedProductsProps) {
  const { productId, categoryId } = props;

  const { data, error, isLoading } = useSWR(
    `/content/products/${productId}/related`,
    () => getRelatedProducts(productId),
    {
      revalidateOnFocus: false
    }
  );

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return <Alert message={parseErrorResponse(error)} variant="danger" />;
  }

  return (
    <div className="row row-cols-2 row-cols-md-2 row-cols-lg-4 g-3">
      {data?.map((p, i) => {
        return (
          <div key={p.id} className="col">
            <ProductGridItem value={p} hideAction />
          </div>
        );
      })}
    </div>
  );
}

export default RelatedProducts;
