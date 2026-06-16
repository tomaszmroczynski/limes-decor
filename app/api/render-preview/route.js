import { products } from "../../../lib/catalog/data";
import {
  renderLightBurnSvg,
  sampleAlbumTemplate,
} from "../../../lib/lightburn/render.mjs";

const templates = {
  "sample-album": sampleAlbumTemplate,
};

export async function POST(request) {
  const body = await request.json();
  const product = products.find((item) => item.id === body.productId);
  const template = templates[product?.templateId];

  if (!product || !template) {
    return Response.json(
      { error: "unknown_product_or_template" },
      { status: 400 },
    );
  }

  const result = renderLightBurnSvg({
    template,
    values: {
      names: body.values?.names ?? "",
      dedication: body.values?.dedication ?? "",
    },
  });

  return Response.json(result);
}
