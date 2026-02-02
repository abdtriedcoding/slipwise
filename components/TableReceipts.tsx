"use client";

import { useState } from "react";
import { ReceiptText, Trash2 } from "lucide-react";
import type { ProcessedReceipt } from "@/lib/types";
import { formatDisplayDate, toTitleCase } from "@/lib/utils";
import ReceiptDetailsDialog from "./ReceiptDetailsDialog";

interface TableReceiptsProps {
  processedReceipts: ProcessedReceipt[];
  onDeleteReceipt: (receiptId: string) => void;
  onStartOver: () => void;
}

function calculateTotals(receipts: ProcessedReceipt[]) {
  const totalSpending = receipts.reduce(
    (sum, receipt) => sum + receipt.amount,
    0
  );
  return totalSpending;
}

export default function TableReceipts({
  processedReceipts,
  onDeleteReceipt,
  onStartOver,
}: TableReceiptsProps) {
  const [selectedReceipt, setSelectedReceipt] =
    useState<ProcessedReceipt | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const totalSpending = calculateTotals(processedReceipts);

  const sortedReceipts = [...processedReceipts].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const handleDateSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleRowClick = (receipt: ProcessedReceipt) => {
    setSelectedReceipt(receipt);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedReceipt(null);
  };

  return (
    <section className="record">
      <div className="record-top">
        <h1 className="record-title">Spend record</h1>
        <button type="button" className="btn btn-quiet" onClick={onStartOver}>
          Start Over
        </button>
      </div>

      <div className="record-scroll">
        <table className="record-table">
          <thead>
            <tr>
              <th scope="col">Receipt</th>
              <th scope="col">
                <button type="button" className="sort-btn" onClick={handleDateSort}>
                  Date <span aria-hidden="true">{sortOrder === "asc" ? "↑" : "↓"}</span>
                </button>
              </th>
              <th scope="col">Vendor</th>
              <th scope="col">Category</th>
              <th scope="col">Payment Method</th>
              <th scope="col">Tax Amount</th>
              <th scope="col">Amount</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedReceipts.map((receipt) => (
              <tr
                key={receipt.id}
                tabIndex={0}
                role="button"
                aria-label={`Open record from ${receipt.vendor}`}
                onClick={() => handleRowClick(receipt)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleRowClick(receipt);
                  }
                }}
              >
                <td data-label="Receipt">
                  {receipt.thumbnail && !receipt.thumbnail.startsWith("/") ? (
                    <img
                      src={receipt.thumbnail}
                      alt=""
                      width={40}
                      height={40}
                      className="thumb"
                    />
                  ) : (
                    <span className="no-thumb" aria-hidden="true">
                      <ReceiptText size={18} />
                    </span>
                  )}
                </td>
                <td className="num when" data-label="Date">{formatDisplayDate(receipt.date)}</td>
                <td className="strong vendor" data-label="Vendor">{receipt.vendor}</td>
                <td data-label="Category">{toTitleCase(receipt.category)}</td>
                <td data-label="Payment Method">{toTitleCase(receipt.paymentMethod)}</td>
                <td className="num" data-label="Tax Amount">${receipt.taxAmount.toFixed(2)}</td>
                <td className="num strong" data-label="Amount">${receipt.amount.toFixed(2)}</td>
                <td data-label="Actions">
                  <button
                    type="button"
                    className="icon-btn"
                    aria-label={`Delete receipt from ${receipt.vendor}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteReceipt(receipt.id);
                    }}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={7} data-label="Total">Total:</td>
              <td className="num" data-label="Amount">${totalSpending.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <ReceiptDetailsDialog
        receipt={selectedReceipt}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onDelete={onDeleteReceipt}
      />
    </section>
  );
}
