"use client";

import type React from "react";
import { UploadedFile } from "@/lib/types";
import { useReceiptManager } from "@/lib/useReceiptManager";
import UploadReceiptPage from "@/components/UploadReceiptPage";
import ResultsPage from "@/components/ResultsPage";
import { useToast } from "@/ui/toast";

export default function HomePage() {
  const { addToast } = useToast();
  const {
    receipts,
    breakdown,
    isProcessing,
    isLoaded,
    hasData,
    addReceipts,
    processFiles,
    selectFiles,
    startProcessing,
    deleteReceipt,
    clearAll,
  } = useReceiptManager();

  const handleProcessFiles = async (uploadedFiles: UploadedFile[]) => {
    const result = await addReceipts(uploadedFiles);

    if (result.duplicatesCount > 0) {
      addToast(
        `${result.duplicatesCount} duplicate receipt${
          result.duplicatesCount > 1 ? "s" : ""
        } ${result.duplicatesCount > 1 ? "were" : "was"} skipped`,
        "warning"
      );
    }

    const newReceiptsCount = result.receipts.length - receipts.length;
    if (newReceiptsCount > 0) {
      addToast(
        `Successfully added ${newReceiptsCount} new receipt${
          newReceiptsCount > 1 ? "s" : ""
        }!`,
        "success"
      );
    }
  };

  const handleAddMoreReceipts = async () => {
    const files = await selectFiles();
    if (files.length > 0) {
      startProcessing();
      const processedFiles = await processFiles(files);
      const result = await addReceipts(processedFiles);

      if (result.duplicatesCount > 0) {
        addToast(
          `${result.duplicatesCount} duplicate receipt${
            result.duplicatesCount > 1 ? "s" : ""
          } ${result.duplicatesCount > 1 ? "were" : "was"} skipped`,
          "warning"
        );
      }

      const newReceiptsCount = result.receipts.length - receipts.length;
      if (newReceiptsCount > 0) {
        addToast(
          `Successfully added ${newReceiptsCount} new receipt${
            newReceiptsCount > 1 ? "s" : ""
          }!`,
          "success"
        );
      }
    }
  };

  const handleDeleteReceipt = (receiptId: string) => {
    deleteReceipt(receiptId);
  };

  const handleStartOver = () => {
    clearAll();
  };

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="loading-body">
          <div className="loader keep-motion" aria-hidden="true" />
          <p className="loading-text">Loading your receipts…</p>
        </div>
      </div>
    );
  }

  if (hasData && breakdown) {
    return (
      <ResultsPage
        processedReceipts={receipts}
        spendingBreakdown={breakdown}
        onAddMoreReceipts={handleAddMoreReceipts}
        onDeleteReceipt={handleDeleteReceipt}
        onStartOver={handleStartOver}
        isProcessing={isProcessing}
      />
    );
  }

  return (
    <UploadReceiptPage
      onProcessFiles={handleProcessFiles}
      processFiles={processFiles}
    />
  );
}
