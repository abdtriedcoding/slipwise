"use client";

import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReceiptText, Trash2, X } from "lucide-react";
import type { ProcessedReceipt } from "@/lib/types";
import { formatDisplayDate, toTitleCase } from "@/lib/utils";

interface ReceiptDetailsDialogProps {
  receipt: ProcessedReceipt | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (receiptId: string) => void;
}

export default function ReceiptDetailsDialog({
  receipt,
  isOpen,
  onClose,
  onDelete,
}: ReceiptDetailsDialogProps) {
  if (!receipt) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent showCloseButton={false}>
        <DialogTitle className="visually-hidden">
          Receipt Details - {receipt.vendor}
        </DialogTitle>
        <div className="dialog-grid">
          {receipt.thumbnail && !receipt.thumbnail.startsWith("/") ? (
            <img
              src={receipt.thumbnail}
              alt=""
              width={320}
              height={400}
              className="dialog-image"
            />
          ) : (
            <div className="dialog-image no-thumb" aria-hidden="true">
              <ReceiptText size={48} />
            </div>
          )}

          <div>
            <h2 className="dialog-vendor">{receipt.vendor}</h2>
            <p className="dialog-date">{formatDisplayDate(receipt.date)}</p>

            <dl className="dialog-rows">
              <div className="dialog-row">
                <dt>Amount</dt>
                <dd>${receipt.amount.toFixed(2)} USD</dd>
              </div>
              {receipt.originalAmount && receipt.currency && receipt.currency !== "USD" && (
                <>
                  <div className="dialog-row">
                    <dt>Original Amount</dt>
                    <dd>{receipt.originalAmount.toFixed(2)} {receipt.currency}</dd>
                  </div>
                  {receipt.exchangeRate && (
                    <div className="dialog-row">
                      <dt>Exchange Rate</dt>
                      <dd>1 {receipt.currency} = {(1 / receipt.exchangeRate).toFixed(4)} USD</dd>
                    </div>
                  )}
                </>
              )}
              <div className="dialog-row">
                <dt>Category</dt>
                <dd>{toTitleCase(receipt.category)}</dd>
              </div>
              <div className="dialog-row">
                <dt>Payment Method</dt>
                <dd>{toTitleCase(receipt.paymentMethod)}</dd>
              </div>
              <div className="dialog-row">
                <dt>Tax Amount</dt>
                <dd>${receipt.taxAmount.toFixed(2)} USD</dd>
              </div>
              {receipt.originalTaxAmount && receipt.currency && receipt.currency !== "USD" && (
                <div className="dialog-row">
                  <dt>Original Tax</dt>
                  <dd>{receipt.originalTaxAmount.toFixed(2)} {receipt.currency}</dd>
                </div>
              )}
            </dl>

            <div className="dialog-actions">
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  onDelete(receipt.id);
                  onClose();
                }}
              >
                <Trash2 size={15} aria-hidden="true" />
                Delete
              </button>
            </div>
          </div>

          <DialogClose className="dialog-close icon-btn" aria-label="Close">
            <X size={16} aria-hidden="true" />
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
