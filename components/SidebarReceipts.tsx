"use client";

import type { ProcessedReceipt, SpendingBreakdown } from "@/lib/types";
import { toTitleCase } from "@/lib/utils";
import { Upload } from "lucide-react";

interface SidebarReceiptsProps {
  processedReceipts: ProcessedReceipt[];
  spendingBreakdown: SpendingBreakdown;
  onAddMoreReceipts: () => void;
  isProcessing: boolean;
}

function calculateTotals(receipts: ProcessedReceipt[]) {
  const totalSpending = receipts.reduce(
    (sum, receipt) => sum + receipt.amount,
    0
  );
  const totalReceipts = receipts.length;
  return { totalSpending, totalReceipts };
}

export default function SidebarReceipts({
  processedReceipts,
  spendingBreakdown,
  onAddMoreReceipts,
  isProcessing,
}: SidebarReceiptsProps) {
  const { totalSpending, totalReceipts } = calculateTotals(processedReceipts);

  return (
    <aside className="panel summary">
      <p className="summary-label">Total Spending</p>
      <p className="reading">${totalSpending.toFixed(2)}</p>
      <p className="count-line">
        {totalReceipts} {totalReceipts === 1 ? "receipt" : "receipts"} processed
      </p>

      <div className="breakdown">
        {spendingBreakdown.categories.map((category) => (
          <div className="breakdown-row" key={category.name}>
            <span className="breakdown-name">{toTitleCase(category.name)}</span>
            <span className="breakdown-amount">${category.amount.toFixed(2)}</span>
            <span className="breakdown-share">{category.percentage}%</span>
          </div>
        ))}
      </div>

      <div className="upload-block">
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={onAddMoreReceipts}
          disabled={isProcessing}
        >
          <Upload size={15} aria-hidden="true" />
          {isProcessing ? "Uploading receipts…" : "Upload Receipts"}
        </button>
      </div>
    </aside>
  );
}
