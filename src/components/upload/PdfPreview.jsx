import React from 'react';
import { useTranslation } from 'react-i18next';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function PdfPreview({ url }) {
  const { t } = useTranslation();
  return (
    <Document
      file={url}
      loading={<div className="text-sm text-slate-400">{t("upload.preview.loadingPdf")}</div>}
      error={<div className="text-sm text-slate-400">{t("upload.preview.pdfError")}</div>}
    >
      <Page pageNumber={1} width={320} />
    </Document>
  );
}
