import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { RoiHiringInputs, RoiHiringResults } from '../calculations/roiHiring';
import {
  CREATION_CREDITS,
  CREDIT_PER_RESUME_SHORTLIST,
  CREDIT_PER_SHORTLISTED_ASSESSMENT,
  CREDIT_PER_SHORTLISTED_INTERVIEW,
  IN_PER_CREDIT,
  SKILLBREW_DISCOUNT,
} from '../calculations/roiHiring';
import logoUrl from '../Skillbrew Logo.svg';

const MARGIN = 14;
const PAGE_W = 210;
const CONTENT_W = PAGE_W - MARGIN * 2;
const BRAND: [number, number, number] = [5, 85, 200];
const TEXT: [number, number, number] = [34, 34, 34];

/**
 * Indian style amounts for PDF: lakhs/crores with L/Cr, else grouped.
 * Uses ASCII "Rs " instead of ₹ so Helvetica renders correctly (Unicode ₹ can appear as a stray glyph).
 */
export function formatIndianMoney(n: number): string {
  const x = Math.round(n);
  if (!Number.isFinite(x)) return 'Rs 0';
  const abs = Math.abs(x);
  const p = 'Rs ';
  if (abs >= 1e7) {
    return `${p}${(x / 1e7).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr`;
  }
  if (abs >= 1e5) {
    return `${p}${(x / 1e5).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L`;
  }
  return `${p}${x.toLocaleString('en-IN')}`;
}

function formatHours(n: number): string {
  return `${Math.round(n).toLocaleString('en-IN')} hrs`;
}

function formatDecimal(n: number, max = 3): string {
  if (!Number.isFinite(n)) return '0';
  return n.toLocaleString('en-IN', { maximumFractionDigits: max });
}

type JsPDFWithTable = jsPDF & { lastAutoTable?: { finalY: number } };

function getFinalY(doc: JsPDFWithTable, fallback: number): number {
  return doc.lastAutoTable?.finalY ?? fallback;
}

type LogoRaster = { dataUrl: string; aspect: number };

/** Rasterize logo for jsPDF (PNG data URL). Returns null if loading fails. */
async function loadLogoPngDataUrl(src: string): Promise<LogoRaster | null> {
  try {
    const res = await fetch(src);
    const svgText = await res.text();
    const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
    const objUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('img'));
      img.src = objUrl;
    });
    const w = img.naturalWidth || 240;
    const h = img.naturalHeight || 80;
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      URL.revokeObjectURL(objUrl);
      return null;
    }
    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(objUrl);
    return { dataUrl: canvas.toDataURL('image/png'), aspect: w / h };
  } catch {
    return null;
  }
}

export async function downloadRoiPdf(inputs: RoiHiringInputs, results: RoiHiringResults): Promise<void> {
  const company = inputs.companyName.trim() || 'Company';
  const generatedAt = new Date();
  const dateStr = generatedAt.toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' });

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const d = doc as JsPDFWithTable;

  let y = MARGIN;

  const newPageIfNeeded = (needMm: number) => {
    if (y + needMm > 287) {
      doc.addPage();
      y = MARGIN;
    }
  };

  // ── Header: logo + title (left), company + date (right)
  const logoRaster = await loadLogoPngDataUrl(logoUrl);
  const maxLogoW = 58;
  let logoW = 0;
  let logoH = 0;
  if (logoRaster) {
    const targetH = 15;
    logoH = targetH;
    logoW = logoH * logoRaster.aspect;
    if (logoW > maxLogoW) {
      logoW = maxLogoW;
      logoH = logoW / logoRaster.aspect;
    }
    doc.addImage(logoRaster.dataUrl, 'PNG', MARGIN, y, logoW, logoH);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...BRAND);
  const titleX = logoRaster ? MARGIN + logoW + 5 : MARGIN;
  const titleBaseline = y + Math.max(logoH * 0.72, 8);
  doc.text('Hiring ROI Report', titleX, titleBaseline);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...TEXT);
  const rightBlock = [company, dateStr];
  const headerTop = y + 2;
  rightBlock.forEach((line, i) => {
    const tw = doc.getTextWidth(line);
    doc.text(line, PAGE_W - MARGIN - tw, headerTop + 4 + i * 5);
  });

  y += Math.max(logoH, 12) + 5;

  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 6;

  // ── Inputs summary (2-column table)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...BRAND);
  doc.text('Inputs summary', MARGIN, y);
  y += 5;

  const inputRows: string[][] = [
    ['Annual tech positions', String(inputs.techAnnualPositions)],
    ['Annual non-tech positions', String(inputs.nonTechAnnualPositions)],
    ['Avg resumes received per tech job', String(inputs.techResumesReceived)],
    ['Avg resumes received per non-tech job', String(inputs.nonTechResumesReceived)],
    ['Avg shortlisted per tech job', String(inputs.techShortlisted)],
    ['Avg shortlisted per non-tech job', String(inputs.nonTechShortlisted)],
    ['HR hours per resume (manual shortlisting)', `${formatDecimal(inputs.hrHoursPerResumeManualShortlist)} hr`],
    ['Scheduling hours per shortlisted resume', `${formatDecimal(inputs.interviewSchedulingHoursPerShortlisted)} hr`],
    ['Expert interview hours per shortlisted resume', `${formatDecimal(inputs.expertInterviewHoursPerShortlisted)} hr`],
    ['Manager feedback hours per shortlisted resume', `${formatDecimal(inputs.feedbackManagerHoursPerShortlisted)} hr`],
    ['Job board / sourcing (annual)', formatIndianMoney(inputs.jobBoardAnnualCost)],
    ['HR cost per hour', formatIndianMoney(inputs.hrCostPerHour)],
    ['Manager / engineer cost per hour', formatIndianMoney(inputs.managerCostPerHour)],
  ];

  autoTable(d, {
    startY: y,
    head: [['Input', 'Value']],
    body: inputRows,
    theme: 'grid',
    tableWidth: CONTENT_W,
    styles: {
      fontSize: 8,
      cellPadding: 2.2,
      textColor: TEXT,
      overflow: 'linebreak',
    },
    headStyles: { fillColor: BRAND, textColor: 255, fontStyle: 'bold', fontSize: 8 },
    columnStyles: {
      0: { cellWidth: CONTENT_W * 0.5 },
      1: { cellWidth: CONTENT_W * 0.5, halign: 'right' },
    },
    margin: { left: MARGIN, right: MARGIN },
  });
  y = getFinalY(d, y) + 8;

  newPageIfNeeded(55);

  // ── Current process cost breakdown
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...BRAND);
  doc.text('Current process cost breakdown', MARGIN, y);
  y += 5;

  const currentRows: string[][] = [
    ['Resume shortlisting', formatIndianMoney(results.current.resumeShortlistingCost)],
    ['Interview scheduling (HR time)', formatIndianMoney(results.current.interviewSchedulingCost)],
    ['Expert interview + manager feedback', formatIndianMoney(results.current.interviewAndFeedbackCost)],
    ['Job boards / sourcing', formatIndianMoney(results.current.additionalCost)],
  ];

  autoTable(d, {
    startY: y,
    head: [['Line item', 'Amount (Rs)']],
    body: currentRows,
    foot: [['Total annual cost (current)', formatIndianMoney(results.current.total)]],
    theme: 'grid',
    tableWidth: CONTENT_W,
    styles: {
      fontSize: 8,
      cellPadding: { top: 2, right: 3, bottom: 2, left: 2 },
      textColor: TEXT,
      overflow: 'linebreak',
    },
    headStyles: { fillColor: BRAND, textColor: 255, fontStyle: 'bold', fontSize: 8 },
    footStyles: { fillColor: [240, 248, 255], textColor: TEXT, fontStyle: 'bold', fontSize: 9 },
    columnStyles: {
      0: { cellWidth: CONTENT_W * 0.44 },
      1: { halign: 'right', cellWidth: CONTENT_W * 0.56 },
    },
    margin: { left: MARGIN, right: MARGIN },
  });
  y = getFinalY(d, y) + 8;

  newPageIfNeeded(60);

  // ── Skillbrew pricing
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...BRAND);
  doc.text('Skillbrew pricing breakdown', MARGIN, y);
  y += 5;

  const discountPct = Math.round(SKILLBREW_DISCOUNT * 100);

  const fmtCreditsInr = (credits: number, inr: number) =>
    `${credits.toLocaleString('en-IN')} C\n${formatIndianMoney(inr)}`;

  /** Line-item credits (footer with totals sits in the following table below Credit value). */
  const sbRowsMain: string[][] = [
    [
      `Resume shortlist credits (${CREDIT_PER_RESUME_SHORTLIST} C per resume x positions)`,
      fmtCreditsInr(results.skillbrew.resumeShortlistCredits, results.skillbrew.resumeShortlistInr),
    ],
    [
      `Proctored assessment (${CREATION_CREDITS} C + shortlisted x ${CREDIT_PER_SHORTLISTED_ASSESSMENT} C per position)`,
      fmtCreditsInr(results.skillbrew.proctoredAssessmentCredits, results.skillbrew.proctoredAssessmentInr),
    ],
    [
      `Proctored interview (${CREATION_CREDITS} C + shortlisted x ${CREDIT_PER_SHORTLISTED_INTERVIEW} C per position)`,
      fmtCreditsInr(results.skillbrew.proctoredInterviewCredits, results.skillbrew.proctoredInterviewInr),
    ],
  ];

  const sbTableCommon = {
    theme: 'grid' as const,
    tableWidth: CONTENT_W,
    styles: {
      fontSize: 7.5,
      cellPadding: { top: 2, right: 3, bottom: 2, left: 2 },
      textColor: TEXT,
      overflow: 'linebreak' as const,
    },
    headStyles: { fillColor: BRAND, textColor: 255, fontStyle: 'bold' as const, fontSize: 8 },
    columnStyles: {
      0: { cellWidth: CONTENT_W * 0.5 },
      1: { halign: 'right' as const, cellWidth: CONTENT_W * 0.5 },
    },
    margin: { left: MARGIN, right: MARGIN },
  };

  autoTable(d, {
    startY: y,
    head: [['Line item', 'Credits / amount (Rs)']],
    body: sbRowsMain,
    ...sbTableCommon,
  });
  y = getFinalY(d, y) + 5;

  /** Credit value row, then subtotal / discount / final in the table footer (single table = no repeated foot). */
  autoTable(d, {
    startY: y,
    head: [['Line item', 'Credits / amount (Rs)']],
    body: [
      [
        `Credit value (${formatIndianMoney(IN_PER_CREDIT)} per credit)`,
        `${formatIndianMoney(IN_PER_CREDIT)} / C`,
      ],
    ],
    foot: [
      ['Subtotal (before discount)', formatIndianMoney(results.skillbrew.subtotalBeforeDiscountInr)],
      [
        `Discount (${discountPct}% off)`,
        `- ${formatIndianMoney(results.skillbrew.subtotalBeforeDiscountInr - results.skillbrew.finalAmountInr)}`,
      ],
      ['Final amount payable', formatIndianMoney(results.skillbrew.finalAmountInr)],
    ],
    ...sbTableCommon,
    footStyles: { fillColor: [255, 248, 240], textColor: TEXT, fontStyle: 'bold', fontSize: 8.5 },
  });
  y = getFinalY(d, y) + 8;

  newPageIfNeeded(45);

  // ── Impact summary (2×2)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...BRAND);
  doc.text('Impact summary', MARGIN, y);
  y += 5;

  const impactBody: string[][] = [
    [
      'Annual operational savings',
      formatIndianMoney(results.impact.revenueIncreasedInr),
      'Hours saved per year',
      `${results.impact.hoursSaved.toLocaleString('en-IN')} hrs`,
    ],
    [
      'Automation uplift index',
      `${results.impact.moreAutomationPercent}%`,
      'Hiring quality uplift index',
      `${results.impact.moreGoodHiresPercent}%`,
    ],
  ];

  autoTable(d, {
    startY: y,
    body: impactBody,
    theme: 'grid',
    tableWidth: CONTENT_W,
    styles: { fontSize: 8.5, cellPadding: 2.5, textColor: TEXT, overflow: 'linebreak' },
    columnStyles: {
      0: { cellWidth: CONTENT_W * 0.28, fontStyle: 'bold' },
      1: { cellWidth: CONTENT_W * 0.22, halign: 'right', fontStyle: 'bold' },
      2: { cellWidth: CONTENT_W * 0.28, fontStyle: 'bold' },
      3: { cellWidth: CONTENT_W * 0.22, halign: 'right', fontStyle: 'bold' },
    },
    margin: { left: MARGIN, right: MARGIN },
  });
  y = getFinalY(d, y) + 8;

  newPageIfNeeded(35);

  // ── Hours model
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...BRAND);
  doc.text('Hours model', MARGIN, y);
  y += 5;

  autoTable(d, {
    startY: y,
    head: [['Workflow', 'Estimated hours (annual)']],
    body: [
      ['Manual process (shortlist + scheduling + expert + feedback)', formatHours(results.hours.currentTotalHours)],
      ['Illustrative Skillbrew workflow (automated / async)', formatHours(results.hours.skillbrewEquivalentHours)],
    ],
    theme: 'grid',
    tableWidth: CONTENT_W,
    styles: { fontSize: 8, cellPadding: 2.5, textColor: TEXT, overflow: 'linebreak' },
    headStyles: { fillColor: BRAND, textColor: 255, fontStyle: 'bold', fontSize: 8 },
    columnStyles: {
      0: { cellWidth: CONTENT_W * 0.55 },
      1: { halign: 'right', cellWidth: CONTENT_W * 0.45 },
    },
    margin: { left: MARGIN, right: MARGIN },
  });
  y = getFinalY(d, y) + 8;

  newPageIfNeeded(40);

  // ── What Skillbrew eliminates
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...BRAND);
  doc.text('What Skillbrew eliminates', MARGIN, y);
  y += 5;

  const bullets = [
    'No job posting fees: unlimited job posts.',
    'Structured feedback and alignment via Hiring Cell (less back-and-forth).',
    'Automated email and WhatsApp communications, plus templates to save writing time.',
  ];
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...TEXT);
  bullets.forEach((b) => {
    const lines = doc.splitTextToSize(`• ${b}`, CONTENT_W - 4);
    newPageIfNeeded(lines.length * 4 + 2);
    doc.text(lines, MARGIN + 2, y);
    y += lines.length * 4 + 2;
  });

  y += 4;
  newPageIfNeeded(22);

  // ── Footer
  doc.setDrawColor(230, 230, 230);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 5;
  doc.setFontSize(7.5);
  doc.setTextColor(100, 100, 100);
  const footerLines = [
    `Prepared for: ${company}`,
    `Generated: ${dateStr}`,
    'Note: All figures are illustrative and derived from the inputs you provided in the calculator.',
  ];
  footerLines.forEach((line) => {
    doc.text(line, MARGIN, y);
    y += 4;
  });

  const safeName = company.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').slice(0, 48);
  doc.save(`Skillbrew-Hiring-ROI-${safeName || 'Report'}.pdf`);
}
