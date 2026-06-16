import crypto from "node:crypto";
import path from "node:path";
import TextToSVG from "text-to-svg";

const fallbackFontPath = path.join(
  process.cwd(),
  "node_modules",
  "text-to-svg",
  "build",
  "fonts",
  "ipag.ttf",
);

const textToSvg = TextToSVG.loadSync(fallbackFontPath);
const PT_TO_MM = 0.352777778;
const DISALLOWED_CONTROL = /[\u0000-\u001f\u007f]/;
const EMOJI_OR_SYMBOL = /[\p{Extended_Pictographic}]/u;

export const lightBurnLayers = {
  engraveFill: "#000000",
  cutLine: "#FF0000",
  scoreLine: "#0000FF",
  toolFrame: "#00AA00",
};

export const sampleAlbumTemplate = {
  id: "sample-album",
  version: "0.1.0",
  canvasWidthMm: 160,
  canvasHeightMm: 110,
  textBoxes: [
    {
      id: "names",
      xMm: 35,
      yMm: 36,
      widthMm: 90,
      heightMm: 18,
      align: "center",
      valign: "middle",
      sizeMinPt: 14,
      sizeMaxPt: 26,
      lineHeight: 1.18,
      maxLines: 2,
      maxChars: 42,
      transform: "uppercase",
      layerColor: lightBurnLayers.engraveFill,
    },
    {
      id: "dedication",
      xMm: 38,
      yMm: 62,
      widthMm: 84,
      heightMm: 24,
      align: "center",
      valign: "middle",
      sizeMinPt: 10,
      sizeMaxPt: 16,
      lineHeight: 1.24,
      maxLines: 3,
      maxChars: 120,
      transform: "none",
      layerColor: lightBurnLayers.engraveFill,
    },
  ],
  graphics: [
    '<rect x="30" y="28" width="100" height="66" rx="0" ry="0" fill="none" stroke="#0000FF" stroke-width="0.1"/>',
  ],
  registrationFrame:
    '<rect x="0.5" y="0.5" width="159" height="109" fill="none" stroke="#00AA00" stroke-width="0.1" data-output="off"/>',
};

export function renderLightBurnSvg({ template, values }) {
  const warnings = [];
  const paths = [];

  for (const box of template.textBoxes) {
    const raw = values[box.id] ?? "";
    const normalized = normalizeInput(raw, box.transform);
    const validation = validateText(normalized, box);

    if (!validation.ok) {
      warnings.push({ boxId: box.id, reason: validation.reason });
      continue;
    }

    const fit = fitTextToBox(normalized, box);

    if (fit.requiresReview) {
      warnings.push({ boxId: box.id, reason: fit.reason });
      continue;
    }

    paths.push(...renderBoxPaths(fit.lines, fit.fontSizeMm, box));
  }

  const body = [
    ...(template.graphics ?? []),
    ...paths,
    template.registrationFrame,
  ]
    .filter(Boolean)
    .join("\n  ");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${template.canvasWidthMm}mm" height="${template.canvasHeightMm}mm" viewBox="0 0 ${template.canvasWidthMm} ${template.canvasHeightMm}">
  ${body}
</svg>`;

  return {
    svg,
    metadata: {
      templateId: template.id,
      templateVersion: template.version,
      hash: sha256(svg),
      requiresReview: warnings.length > 0,
      warnings,
    },
  };
}

function normalizeInput(value, transform) {
  let text = String(value).normalize("NFC").trim().replace(/\s+/g, " ");

  if (transform === "uppercase") {
    text = text.toLocaleUpperCase("nb-NO");
  }

  if (transform === "capitalize") {
    text = text.replace(/\b\p{L}/gu, (letter) => letter.toLocaleUpperCase("nb-NO"));
  }

  return text;
}

function validateText(text, box) {
  if (!text) {
    return { ok: false, reason: "required_text_missing" };
  }

  if (text.length > box.maxChars) {
    return { ok: false, reason: "text_too_long" };
  }

  if (DISALLOWED_CONTROL.test(text) || EMOJI_OR_SYMBOL.test(text)) {
    return { ok: false, reason: "unsupported_character" };
  }

  return { ok: true };
}

function fitTextToBox(text, box) {
  for (let pt = box.sizeMaxPt; pt >= box.sizeMinPt; pt -= 0.5) {
    const fontSizeMm = pt * PT_TO_MM;
    const lines = wrapText(text, box.widthMm, fontSizeMm);

    if (lines.some((line) => line.requiresReview)) {
      return { requiresReview: true, reason: "word_too_long" };
    }

    const height = lines.length * fontSizeMm * box.lineHeight;

    if (lines.length <= box.maxLines && height <= box.heightMm) {
      return { requiresReview: false, lines, fontSizeMm };
    }
  }

  return { requiresReview: true, reason: "text_does_not_fit" };
}

function wrapText(text, widthMm, fontSizeMm) {
  const words = text.split(" ");
  const lines = [];
  let current = "";

  for (const word of words) {
    if (measureText(word, fontSizeMm).width > widthMm) {
      return [{ requiresReview: true }];
    }

    const candidate = current ? `${current} ${word}` : word;

    if (measureText(candidate, fontSizeMm).width <= widthMm) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function renderBoxPaths(lines, fontSizeMm, box) {
  const lineHeightMm = fontSizeMm * box.lineHeight;
  const totalHeight = lines.length * lineHeightMm;
  const startY = verticalStart(box, totalHeight);

  return lines.map((line, index) => {
    const metrics = measureText(line, fontSizeMm);
    const x = horizontalStart(box, metrics.width);
    const y = startY + index * lineHeightMm;
    const d = textToSvg.getD(line, { x, y, fontSize: fontSizeMm, anchor: "top" });

    return `<path d="${d}" fill="${box.layerColor}" fill-rule="nonzero"/>`;
  });
}

function horizontalStart(box, lineWidth) {
  if (box.align === "right") {
    return box.xMm + box.widthMm - lineWidth;
  }

  if (box.align === "center") {
    return box.xMm + (box.widthMm - lineWidth) / 2;
  }

  return box.xMm;
}

function verticalStart(box, totalHeight) {
  if (box.valign === "bottom") {
    return box.yMm + box.heightMm - totalHeight;
  }

  if (box.valign === "middle") {
    return box.yMm + (box.heightMm - totalHeight) / 2;
  }

  return box.yMm;
}

function measureText(text, fontSizeMm) {
  return textToSvg.getMetrics(text, { fontSize: fontSizeMm, anchor: "top" });
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}
