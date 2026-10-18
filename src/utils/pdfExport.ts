import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { LetterItem } from '../types/letter';
import { CVData } from '../types/cv';
import {
  LETTER_FONTS,
  LETTER_SPACINGS,
  LETTER_MARGINS,
  LETTER_FONT_SIZES,
} from '../data/letterTemplates';

export interface ExportLetterOptions {
  letter: LetterItem;
  cvData?: CVData;
  userSignatureUrl?: string | null;
  elementId?: string;
}

export interface ExportCVOptions {
  cvData: CVData;
  title?: string;
  elementId?: string;
}

export type ExportPdfMode = 'cv' | 'letter';

export interface GeneratePdfOptions {
  mode: ExportPdfMode;
  cvOptions?: ExportCVOptions;
  letterOptions?: ExportLetterOptions;
}

/**
 * Cleanly exports a Letter (Cover Letter or Application Letter) to a high-resolution A4 PDF.
 * Ensures the sender details, recipient header, subject, formatted paragraphs,
 * and user's stored signature image are positioned cleanly on an authentic A4 sheet
 * in accordance with the selected template (Minimaliste, Moderne, Classique) and typography.
 */
export async function exportLetterToPdf(options: ExportLetterOptions): Promise<void> {
  const { letter, cvData, userSignatureUrl, elementId = 'printable-letter-sheet' } = options;

  // Check if target element exists in DOM (e.g. active in LetterEditorView)
  const existingElement = document.getElementById(elementId);

  // Effective signature image (letter-specific or user profile default)
  const effectiveSignature = letter.signatureImageUrl || userSignatureUrl || null;

  // Template and typography options
  const templateId = letter.templateId || 'moderne';
  const fontOpt = LETTER_FONTS.find((f) => f.id === letter.fontFamily) || LETTER_FONTS[0];
  const spacingOpt = LETTER_SPACINGS.find((s) => s.id === letter.spacing) || LETTER_SPACINGS[1];
  const marginOpt = LETTER_MARGINS.find((m) => m.id === letter.margin) || LETTER_MARGINS[1];
  const fontSizeOpt = LETTER_FONT_SIZES.find((fs) => fs.id === letter.fontSize) || LETTER_FONT_SIZES[1];
  const accentColor = letter.accentColor || (templateId === 'classique' ? '#334155' : templateId === 'minimaliste' ? '#0f172a' : '#2563eb');

  // Sender information
  const senderName = cvData?.personal?.fullName || 'Alexandre Dupont';
  const senderTitle = cvData?.personal?.title || '';
  const senderEmail = cvData?.personal?.email || '';
  const senderPhone = cvData?.personal?.phone || '';
  const senderAddress = cvData?.personal?.address || 'France';

  const todayFormatted = new Date().toLocaleDateString(
    letter.langue === 'en' ? 'en-US' : letter.langue === 'es' ? 'es-ES' : 'fr-FR',
    {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );

  let targetElementToCapture: HTMLElement;
  let isTempContainer = false;

  if (existingElement) {
    targetElementToCapture = existingElement;
  } else {
    // Build an offscreen pristine A4 container if not currently on editor screen
    isTempContainer = true;
    const offscreen = document.createElement('div');
    offscreen.style.position = 'fixed';
    offscreen.style.left = '-9999px';
    offscreen.style.top = '0';
    offscreen.style.width = '210mm';
    offscreen.style.minHeight = '297mm';
    offscreen.style.backgroundColor = '#ffffff';
    offscreen.style.color = '#0f172a';
    offscreen.style.padding = marginOpt.paddingMm;
    offscreen.style.boxSizing = 'border-box';
    offscreen.style.fontFamily = fontOpt.fontFamily;
    offscreen.style.fontSize = fontSizeOpt.ptSize;
    offscreen.style.lineHeight = String(spacingOpt.lineHeight);
    offscreen.style.display = 'flex';
    offscreen.style.flexDirection = 'column';
    offscreen.style.justifyContent = 'space-between';

    // Paragraphs
    const paras = letter.contenu
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean);

    const paragraphsHtml = paras
      .map(
        (p) =>
          `<p style="margin-bottom: ${spacingOpt.paragraphGap}; text-align: justify; color: #1e293b; line-height: ${spacingOpt.lineHeight}; font-size: ${fontSizeOpt.ptSize}; font-family: ${fontOpt.fontFamily};">${p}</p>`
      )
      .join('');

    const signatureBlockHtml = `
      <div style="margin-top: 36px; padding-top: 16px; display: flex; flex-direction: column; align-items: flex-end;">
        <div style="text-align: right; min-width: 220px;">
          <div style="font-weight: 700; color: #0f172a; margin-bottom: 8px; font-size: ${fontSizeOpt.ptSize};">${senderName}</div>
          ${senderTitle ? `<div style="font-size: 9pt; color: #64748b; margin-bottom: 6px;">${senderTitle}</div>` : ''}
          ${
            effectiveSignature
              ? `<div style="margin-top: 6px;"><img src="${effectiveSignature}" alt="Signature" style="max-height: 70px; max-width: 190px; object-fit: contain; margin-left: auto; display: block;" /></div>`
              : `<div style="height: 48px;"></div>`
          }
        </div>
      </div>
    `;

    const subjectTitle =
      letter.type === 'motivation'
        ? `Candidature au poste de ${letter.poste}`
        : `Demande d'emploi spontanée — ${letter.poste}`;

    let bodyLayoutHtml = '';

    if (templateId === 'minimaliste') {
      // Minimaliste: Airy Swiss editorial layout
      bodyLayoutHtml = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9;">
            <div>
              <div style="font-size: 15pt; font-weight: 800; letter-spacing: -0.02em; color: #0f172a; margin-bottom: 4px;">${senderName}</div>
              <div style="font-size: 9.5pt; color: #64748b; display: flex; gap: 8px;">
                ${senderEmail ? `<span>${senderEmail}</span>` : ''}
                ${senderPhone ? `<span>· ${senderPhone}</span>` : ''}
                ${senderAddress ? `<span>· ${senderAddress}</span>` : ''}
              </div>
            </div>
            <div style="text-align: right; font-size: 9.5pt; color: #64748b;">
              <div style="margin-bottom: 4px;">${todayFormatted}</div>
              <div style="font-weight: 700; color: #0f172a; font-size: 10.5pt;">${letter.entreprise}</div>
              ${letter.recipientName ? `<div>${letter.recipientName}</div>` : ''}
            </div>
          </div>

          <div style="margin-bottom: 24px; padding-bottom: 8px; border-bottom: 1.5px solid #0f172a;">
            <span style="font-size: 9pt; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #0f172a;">Objet : </span>
            <span style="font-size: 10pt; font-weight: 500; color: #334155;">${subjectTitle}</span>
          </div>

          <div>
            ${paragraphsHtml}
          </div>
        </div>
        ${signatureBlockHtml}
      `;
    } else if (templateId === 'classique') {
      // Classique: Formal epistolary French format
      bodyLayoutHtml = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px;">
            <div style="font-size: 9.5pt; color: #334155; line-height: 1.5;">
              <div style="font-size: 13pt; font-weight: 700; color: #0f172a; margin-bottom: 2px;">${senderName}</div>
              ${senderTitle ? `<div style="font-style: italic; color: #475569; margin-bottom: 4px;">${senderTitle}</div>` : ''}
              ${senderAddress ? `<div>${senderAddress}</div>` : ''}
              ${senderPhone ? `<div>Tél : ${senderPhone}</div>` : ''}
              ${senderEmail ? `<div>Courriel : ${senderEmail}</div>` : ''}
            </div>
            <div style="text-align: right; font-size: 9.5pt; color: #334155; line-height: 1.5; max-width: 260px;">
              <div style="margin-bottom: 14px; font-style: italic; color: #475569;">
                ${senderAddress ? senderAddress.split(',')[0] : 'Paris'}, le ${todayFormatted}
              </div>
              <div style="font-weight: 700; font-size: 11pt; color: #0f172a;">${letter.entreprise}</div>
              ${letter.recipientName ? `<div style="font-weight: 600;">${letter.recipientName}</div>` : ''}
              <div style="color: #475569;">À l'attention du service des Ressources Humaines</div>
              ${letter.recipientAddress ? `<div>${letter.recipientAddress}</div>` : ''}
            </div>
          </div>

          <div style="margin-bottom: 24px; padding-bottom: 6px; font-size: 10.5pt; font-weight: 700; color: #0f172a;">
            <span>Objet : </span>
            <span style="text-decoration: underline; font-weight: 600;">${subjectTitle}</span>
          </div>

          <div>
            ${paragraphsHtml}
          </div>
        </div>
        ${signatureBlockHtml}
      `;
    } else {
      // Moderne: Accent header band and styled callouts
      bodyLayoutHtml = `
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 36px; padding-bottom: 20px; border-bottom: 2px solid #e2e8f0; border-top: 4px solid ${accentColor}; padding-top: 16px;">
            <div style="font-size: 9.5pt; color: #334155; line-height: 1.5;">
              <div style="font-size: 14pt; font-weight: 800; color: #0f172a; margin-bottom: 2px;">${senderName}</div>
              ${senderTitle ? `<div style="font-weight: 600; color: ${accentColor}; margin-bottom: 4px;">${senderTitle}</div>` : ''}
              ${senderEmail ? `<div>${senderEmail}</div>` : ''}
              ${senderPhone ? `<div>${senderPhone}</div>` : ''}
              ${senderAddress ? `<div>${senderAddress}</div>` : ''}
            </div>
            <div style="text-align: right; font-size: 9.5pt; color: #475569; line-height: 1.5; background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
              <div style="color: #64748b; margin-bottom: 8px; font-weight: 500;">
                ${senderAddress ? senderAddress.split(',')[0] : 'Paris'}, le ${todayFormatted}
              </div>
              <div style="font-weight: 700; font-size: 11pt; color: #0f172a;">${letter.entreprise}</div>
              ${letter.recipientName ? `<div style="font-weight: 600; color: #1e293b;">${letter.recipientName}</div>` : ''}
              <div style="color: #64748b; font-size: 9pt;">Service Recrutement & Talents</div>
            </div>
          </div>

          <div style="margin-bottom: 24px; padding: 10px 14px; background-color: #f8fafc; border-left: 4px solid ${accentColor}; border-radius: 6px; font-size: 10pt; font-weight: 700; color: #0f172a;">
            <span style="color: ${accentColor};">Objet : </span>
            <span style="font-weight: 500; color: #334155;">${subjectTitle}</span>
          </div>

          <div>
            ${paragraphsHtml}
          </div>
        </div>
        ${signatureBlockHtml}
      `;
    }

    offscreen.innerHTML = bodyLayoutHtml;
    document.body.appendChild(offscreen);
    targetElementToCapture = offscreen;
  }

  try {
    const originalTransform = targetElementToCapture.style.transform;
    targetElementToCapture.style.transform = 'none';

    const canvas = await html2canvas(targetElementToCapture, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 794,
      onclone: (clonedDoc) => {
        const clonedSheet = clonedDoc.getElementById(elementId) || clonedDoc.querySelector('[style*="210mm"]');
        if (clonedSheet) {
          // Hide interactive controls, hover tools, buttons, modals
          clonedSheet.querySelectorAll('.no-print, button, input[type="text"]').forEach((el) => {
            (el as HTMLElement).style.display = 'none';
          });

          // Replace textareas with clean typographic paragraphs to prevent cursor, borders, or clip artifacts
          clonedSheet.querySelectorAll('textarea').forEach((ta) => {
            const p = clonedDoc.createElement('p');
            p.textContent = ta.value;
            p.style.whiteSpace = 'pre-line';
            p.style.lineHeight = String(spacingOpt.lineHeight);
            p.style.color = '#1e293b';
            p.style.textAlign = 'justify';
            p.style.margin = `0 0 ${spacingOpt.paragraphGap} 0`;
            p.style.fontSize = fontSizeOpt.ptSize;
            p.style.fontFamily = fontOpt.fontFamily;
            ta.parentNode?.replaceChild(p, ta);
          });
        }
      },
    });

    targetElementToCapture.style.transform = originalTransform;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

    const cleanCompany = letter.entreprise.replace(/[^a-zA-Z0-9_\u00C0-\u00FF]/g, '_');
    const letterTypeLabel = letter.type === 'demande_emploi' ? 'Demande_Emploi' : 'Lettre_Motivation';
    const fileName = `${letterTypeLabel}_${cleanCompany}_${templateId}.pdf`;

    pdf.save(fileName);
  } finally {
    if (isTempContainer && targetElementToCapture.parentNode) {
      targetElementToCapture.parentNode.removeChild(targetElementToCapture);
    }
  }
}

/**
 * Standard CV PDF Export
 */
export async function exportCVToPdf(options: ExportCVOptions): Promise<void> {
  const { cvData, title, elementId = 'printable-cv-area' } = options;
  const element = document.getElementById(elementId);
  if (!element) return;

  const originalTransform = element.style.transform;
  element.style.transform = 'none';

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: 794,
    });

    element.style.transform = originalTransform;

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');

    const fullName = cvData.personal?.fullName;
    const fileName = fullName
      ? `CV_${fullName.replace(/\s+/g, '_')}.pdf`
      : title
      ? `${title.replace(/\s+/g, '_')}.pdf`
      : 'CV.pdf';

    pdf.save(fileName);
  } catch (err) {
    element.style.transform = originalTransform;
    throw err;
  }
}

/**
 * Unified PDF generator supporting 'cv' and 'letter' modes.
 */
export async function generatePdf(options: GeneratePdfOptions): Promise<void> {
  if (options.mode === 'letter') {
    if (!options.letterOptions) {
      throw new Error("Missing letterOptions for 'letter' PDF export mode.");
    }
    await exportLetterToPdf(options.letterOptions);
  } else {
    if (!options.cvOptions) {
      throw new Error("Missing cvOptions for 'cv' PDF export mode.");
    }
    await exportCVToPdf(options.cvOptions);
  }
}
