import jsPDF from "jspdf";
import type { CartItem } from "./quote-storage";
import { formatUSD, productLabel } from "./pricing";

export type QuotePdfData = {
  referenceId?: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    zip: string;
  };
  timeline?: string;
  notes?: string;
  items: CartItem[];
  totalLow: number;
  totalHigh: number;
  totalMid: number;
  submittedAt: Date;
};

function uniq(values: (string | undefined | null)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => Boolean(v))));
}

function itemSummary(it: CartItem) {
  const cfg = it.config as Record<string, unknown>;
  const exterior = (cfg.exterior as string) ?? "";
  const stuccoInstall = (cfg.stuccoInstall as string) ?? "";
  const exteriorLabel =
    exterior === "Stucco" && stuccoInstall
      ? `Stucco (${stuccoInstall})`
      : exterior;
  return {
    style: (cfg.windowStyle as string) ?? productLabel(it.productType),
    productLine: (cfg.productLine as string) ?? "",
    glass: (cfg.glassType as string) ?? "",
    color: (cfg.color as string) ?? "",
    grid: (cfg.gridStyle as string) ?? "",
    exterior: exteriorLabel,
  };
}

export function generateQuotePdf(data: QuotePdfData): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth();
  const M = 48;
  let y = M;

  // Brand header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, 72, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Pane & Simple", M, 44);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Window Project Summary", W - M, 44, { align: "right" });
  y = 100;

  doc.setTextColor(15, 23, 42);

  // Reference + date
  doc.setFontSize(9);
  doc.setTextColor(100);
  const dateStr = data.submittedAt.toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  doc.text(`Submitted: ${dateStr}`, M, y);
  if (data.referenceId) {
    doc.text(`Ref: ${data.referenceId.slice(0, 8).toUpperCase()}`, W - M, y, { align: "right" });
  }
  y += 24;

  // Customer section
  y = sectionHeader(doc, "Customer Information", M, y, W);
  doc.setFontSize(10);
  doc.setTextColor(40);
  const c = data.customer;
  const lines = [
    `${c.firstName} ${c.lastName}`,
    `${c.email}  •  ${c.phone}`,
    `${c.city}, UT ${c.zip}`,
  ];
  lines.forEach((l) => {
    doc.text(l, M, y);
    y += 14;
  });
  y += 10;

  // Project summary
  y = sectionHeader(doc, "Project Summary", M, y, W);
  const summaries = data.items.map(itemSummary);
  const totalWindows = data.items.reduce((s, i) => s + i.qty, 0);
  const productLines = uniq(summaries.map((s) => s.productLine));
  const glassTypes = uniq(summaries.map((s) => s.glass));
  const colors = uniq(summaries.map((s) => s.color));
  const styles = uniq(summaries.map((s) => s.style));

  doc.setFontSize(10);
  doc.setTextColor(40);
  const kv: [string, string][] = [
    ["Total Windows", String(totalWindows)],
    ["Styles", styles.join(", ") || "—"],
    ["Product Lines", productLines.join(", ") || "—"],
    ["Glass Types", glassTypes.join(", ") || "—"],
    ["Colors", colors.join(", ") || "—"],
  ];
  kv.forEach(([k, v]) => {
    doc.setFont("helvetica", "bold");
    doc.text(k, M, y);
    doc.setFont("helvetica", "normal");
    doc.text(v, M + 110, y, { maxWidth: W - M - 110 - M });
    y += 16;
  });
  y += 8;

  // Window list
  y = sectionHeader(doc, "Windows", M, y, W);
  doc.setFontSize(9);
  data.items.forEach((it, idx) => {
    if (y > 700) { doc.addPage(); y = M; }
    const s = itemSummary(it);
    doc.setFont("helvetica", "bold");
    doc.text(`${idx + 1}. ${s.style}${it.qty > 1 ? `  ×${it.qty}` : ""}`, M, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(90);
    doc.text(`${it.config.width}″ × ${it.config.height}″`, W - M, y, { align: "right" });
    y += 13;
    const detail = [
      s.productLine,
      s.glass,
      s.color,
      s.grid !== "None" ? `Grid: ${s.grid}` : "",
      s.exterior ? `Exterior: ${s.exterior}` : "",
    ]
      .filter(Boolean).join("  •  ");
    doc.text(detail, M + 14, y);
    doc.setTextColor(40);
    y += 18;
  });

  y += 6;
  if (y > 680) { doc.addPage(); y = M; }

  // Total
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(1);
  doc.line(M, y, W - M, y);
  y += 22;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Estimated Project Total", M, y);
  doc.setFontSize(13);
  doc.text(`${formatUSD(data.totalLow)} – ${formatUSD(data.totalHigh)}`, W - M, y, { align: "right" });
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text(
    `Midpoint ${formatUSD(data.totalMid)}. Final pricing confirmed after professional measurement.`,
    M, y,
  );
  y += 22;

  // Timeline + notes
  if (data.timeline) {
    doc.setTextColor(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Timeline:", M, y);
    doc.setFont("helvetica", "normal");
    doc.text(data.timeline, M + 70, y);
    y += 16;
  }
  if (data.notes) {
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", M, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    const wrapped = doc.splitTextToSize(data.notes, W - M * 2);
    doc.text(wrapped, M, y);
    y += wrapped.length * 12 + 8;
  }

  // Footer
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(140);
  doc.text(
    "Pane & Simple  •  Transparent pricing  •  No high-pressure sales  •  Built for Utah weather",
    W / 2, pageH - 24, { align: "center" },
  );

  return doc;
}

function sectionHeader(doc: jsPDF, label: string, x: number, y: number, W: number): number {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(label.toUpperCase(), x, y);
  doc.setDrawColor(220);
  doc.setLineWidth(0.5);
  doc.line(x, y + 4, W - x, y + 4);
  return y + 22;
}

export function downloadQuotePdf(data: QuotePdfData, filename = "pane-and-simple-quote.pdf") {
  const doc = generateQuotePdf(data);
  doc.save(filename);
}

export function quotePdfDataUri(data: QuotePdfData): string {
  return generateQuotePdf(data).output("datauristring");
}