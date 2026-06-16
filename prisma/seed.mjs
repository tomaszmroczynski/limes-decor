import { PrismaClient } from "@prisma/client";

import { categories, products } from "../lib/catalog/data.js";
import { sampleAlbumTemplate } from "../lib/lightburn/render.mjs";

const prisma = new PrismaClient();

const locales = ["no", "pl"];

async function main() {
  await prisma.productTemplate.upsert({
    where: {
      slug_version: {
        slug: sampleAlbumTemplate.id,
        version: sampleAlbumTemplate.version,
      },
    },
    update: {
      canvasWidthMm: sampleAlbumTemplate.canvasWidthMm,
      canvasHeightMm: sampleAlbumTemplate.canvasHeightMm,
      rendererConfig: sampleAlbumTemplate,
      fontId: "text-to-svg-ipag",
      fontVersion: "bundled-3.1.5",
      active: true,
    },
    create: {
      id: sampleAlbumTemplate.id,
      slug: sampleAlbumTemplate.id,
      version: sampleAlbumTemplate.version,
      canvasWidthMm: sampleAlbumTemplate.canvasWidthMm,
      canvasHeightMm: sampleAlbumTemplate.canvasHeightMm,
      rendererConfig: sampleAlbumTemplate,
      fontId: "text-to-svg-ipag",
      fontVersion: "bundled-3.1.5",
      active: true,
    },
  });

  for (const [index, category] of categories.entries()) {
    await prisma.category.upsert({
      where: { slug: category.id },
      update: {
        sortOrder: index,
        active: true,
      },
      create: {
        id: category.id,
        slug: category.id,
        sortOrder: index,
        active: true,
      },
    });

    for (const locale of locales) {
      await prisma.categoryTranslation.upsert({
        where: {
          categoryId_locale: {
            categoryId: category.id,
            locale,
          },
        },
        update: {
          title: category.title[locale],
          eyebrow: category.eyebrow[locale],
          copy: category.copy[locale],
        },
        create: {
          categoryId: category.id,
          locale,
          title: category.title[locale],
          eyebrow: category.eyebrow[locale],
          copy: category.copy[locale],
        },
      });
    }
  }

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.id },
      update: {
        categoryId: product.category,
        templateId: product.templateId,
        status: "active",
        basePriceNokGross: product.price,
        imageUrl: product.image,
        isPersonalized: true,
        requiresDimensions: product.requiresDimensions ?? false,
        allowsExpress: true,
        allowsGiftWrap: true,
      },
      create: {
        id: product.id,
        slug: product.id,
        categoryId: product.category,
        templateId: product.templateId,
        status: "active",
        basePriceNokGross: product.price,
        imageUrl: product.image,
        isPersonalized: true,
        requiresDimensions: product.requiresDimensions ?? false,
        allowsExpress: true,
        allowsGiftWrap: true,
      },
    });

    for (const locale of locales) {
      await prisma.productTranslation.upsert({
        where: {
          productId_locale: {
            productId: product.id,
            locale,
          },
        },
        update: {
          name: product.name[locale],
          shortCopy: product.description[locale],
          tag: product.tag[locale],
          delivery: product.delivery[locale],
        },
        create: {
          productId: product.id,
          locale,
          name: product.name[locale],
          shortCopy: product.description[locale],
          tag: product.tag[locale],
          delivery: product.delivery[locale],
        },
      });
    }

    await seedField(product.id, {
      key: "names",
      type: "text",
      maxChars: 42,
      previewKey: "names",
      sortOrder: 0,
    });
    await seedField(product.id, {
      key: "occasionDate",
      type: "date",
      required: false,
      sortOrder: 1,
    });
    await seedField(product.id, {
      key: "dedication",
      type: "long_text",
      maxChars: 120,
      previewKey: "dedication",
      sortOrder: 2,
    });

    if (product.requiresDimensions) {
      await seedField(product.id, {
        key: "dimensions",
        type: "text",
        maxChars: 80,
        sortOrder: 3,
      });
    }
  }
}

async function seedField(productId, field) {
  await prisma.personalizationField.upsert({
    where: {
      productId_key: {
        productId,
        key: field.key,
      },
    },
    update: {
      type: field.type,
      required: field.required ?? true,
      maxChars: field.maxChars,
      previewKey: field.previewKey,
      sortOrder: field.sortOrder,
    },
    create: {
      productId,
      key: field.key,
      type: field.type,
      required: field.required ?? true,
      maxChars: field.maxChars,
      previewKey: field.previewKey,
      sortOrder: field.sortOrder,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
