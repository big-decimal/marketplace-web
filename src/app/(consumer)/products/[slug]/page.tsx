import { getProductBySlug } from "@/services/ProductService";
import { Metadata, ResolvingMetadata } from "next";
import { cache } from "react";
import ProductPage from "./product-page";
import Alert from "@/components/Alert";
import { parseErrorResponse } from "@/common/utils";

interface Props {
  params: { slug: string };
}
const getProduct = cache(async (slug: string) => {
  return getProductBySlug(slug);
});

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const product = await getProduct(params.slug);

    const previousImages = (await parent).openGraph?.images || [];

    if (product) {
      const desc = process.env.NEXT_PUBLIC_APP_DESCRIPTION;
      return {
        title: product.name,
        description: desc,
        openGraph: {
          url: `${process.env.NEXT_PUBLIC_BASE_URL}/products/${product.slug}`,
          title: product.name,
          description: desc,
          images: [`${product.thumbnail ?? ""}`, ...previousImages],
          type: "website"
        },
        twitter: {
          title: product.name,
          description: desc,
          card: "summary_large_image",
          images: [`${product.thumbnail ?? ""}`, ...previousImages]
        }
      };
    }
  } catch (error) {}

  return {
    title: "Product not found",
  };
}

export default async function Product({ params }: Props) {
  try {
    const product = await getProduct(params.slug);

    // if (!product) {
    //   notFound();
    // }

    return <ProductPage product={product} />;
  } catch (error) {
    return (
      <div className="container py-3">
        <Alert message={parseErrorResponse(error)} variant="danger" />
      </div>
    );
  }
}
