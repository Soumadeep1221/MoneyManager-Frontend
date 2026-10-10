"use client";

import * as React from "react";
import { Download, FileSpreadsheet, Mail } from "lucide-react";
import { isApiError, reportService } from "@/lib/api";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";

type ReportType = "income" | "expense";

const reportCopy: Record<ReportType, { label: string; downloadError: string; emailSuccess: string; emailError: string }> = {
  income: {
    label: "income",
    downloadError: "We couldn't download the income report. Please try again.",
    emailSuccess: "Income report has been emailed successfully.",
    emailError: "We couldn't email the income report. Please try again.",
  },
  expense: {
    label: "expense",
    downloadError: "We couldn't download the expense report. Please try again.",
    emailSuccess: "Expense report has been emailed successfully.",
    emailError: "We couldn't email the expense report. Please try again.",
  },
};

function userFacingReportError(error: unknown, fallback: string): string {
  if (!isApiError(error)) return fallback;
  if (error.status === 0) return "Unable to connect to the server. Please try again.";
  if (error.status >= 500) {
    return error.message && error.message !== "Unable to generate the report. Please try again."
      ? error.message
      : "We couldn't generate the report. Please try again.";
  }
  return error.message || fallback;
}

export function ReportActions({ type }: { type: ReportType }) {
  const { success, error: toastError } = useToast();
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isEmailing, setIsEmailing] = React.useState(false);
  const copy = reportCopy[type];

  async function handleDownload() {
    setIsDownloading(true);
    try {
      if (type === "income") await reportService.downloadIncomeExcel();
      else await reportService.downloadExpenseExcel();
      success(`${type === "income" ? "Income" : "Expense"} Excel downloaded.`);
    } catch (error) {
      toastError(userFacingReportError(error, copy.downloadError));
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleEmail() {
    setIsEmailing(true);
    try {
      if (type === "income") await reportService.emailIncomeReport();
      else await reportService.emailExpenseReport();
      success(copy.emailSuccess);
    } catch (error) {
      toastError(userFacingReportError(error, copy.emailError));
    } finally {
      setIsEmailing(false);
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2 sm:items-end">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleDownload}
          loading={isDownloading}
          aria-label={`Download current month's ${copy.label} report`}
          title={`Download current month's ${copy.label} report`}
        >
          <Download size={14} />
          {isDownloading ? "Downloading..." : "Download Excel"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleEmail}
          loading={isEmailing}
          aria-label={`Email current month's ${copy.label} report`}
          title={`Email current month's ${copy.label} report`}
        >
          <Mail size={14} />
          {isEmailing ? "Sending..." : "Email Report"}
        </Button>
      </div>
      <p className="flex items-center gap-1 text-[11px] text-foreground-muted">
        <FileSpreadsheet size={12} />
        Current month
      </p>
    </div>
  );
}
