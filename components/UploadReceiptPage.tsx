"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { AlertTriangle, Check, LoaderCircle, Upload, X } from "lucide-react";
import { UploadedFile } from "@/lib/types";

import Header from "./Header";
import Footer from "./Footer";
import { Tooltip } from "@/ui/tooltip";

interface UploadReceiptPageProps {
  onProcessFiles: (uploadedFiles: UploadedFile[]) => Promise<void>;
  processFiles: (files: File[]) => Promise<UploadedFile[]>;
}

export default function UploadReceiptPage({
  onProcessFiles,
  processFiles,
}: UploadReceiptPageProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const autoRedirectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const allFilesProcessed =
      uploadedFiles.length > 0 &&
      uploadedFiles.every((f) => f.status !== "processing");
    const hasSuccessfulReceipts = uploadedFiles.some(
      (f) => f.status === "receipt" && f.receipt
    );

    if (allFilesProcessed && hasSuccessfulReceipts) {
      if (autoRedirectTimerRef.current) {
        clearTimeout(autoRedirectTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }

      setCountdown(5);

      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            if (countdownTimerRef.current) {
              clearInterval(countdownTimerRef.current);
              countdownTimerRef.current = null;
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      autoRedirectTimerRef.current = setTimeout(async () => {
        setCountdown(null);
        await handleAutoGenerateResults();
      }, 5000);
    } else {
      setCountdown(null);
    }

    return () => {
      if (autoRedirectTimerRef.current) {
        clearTimeout(autoRedirectTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [uploadedFiles]);

  const clearAutoRedirectTimer = () => {
    if (autoRedirectTimerRef.current) {
      clearTimeout(autoRedirectTimerRef.current);
      autoRedirectTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
  };

  const onDrop = (acceptedFiles: File[]) => {
    clearAutoRedirectTimer();
    handleFileUpload(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "image/png": [],
      "image/jpeg": [],
      "image/jpg": [],
      "image/webp": [],
    },
  });

  const handleFileUpload = async (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: `temp-${Date.now()}-${Math.random()}`,
      name: file.name,
      file,
      status: "processing" as const,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    try {
      const processedFiles = await processFiles(files);

      setUploadedFiles((prev) =>
        prev.map((file) => {
          const result = processedFiles.find((r) => r.name === file.name);
          if (result) {
            return { ...file, ...result };
          }
          return file;
        })
      );
    } catch (error) {
      console.error("Error processing files:", error);
      setUploadedFiles((prev) =>
        prev.map((file) => {
          if (newFiles.some((newFile) => newFile.name === file.name)) {
            return {
              ...file,
              status: "error" as const,
              error:
                error instanceof Error ? error.message : "Processing failed",
            };
          }
          return file;
        })
      );
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const allFilesProcessed =
    uploadedFiles.length > 0 &&
    uploadedFiles.every((f) => f.status !== "processing");
  const hasSuccessfulReceipts = uploadedFiles.some(
    (f) => f.status === "receipt" && f.receipt
  );

  const handleAutoGenerateResults = async () => {
    await onProcessFiles(uploadedFiles);
  };

  return (
    <div className="app-shell">
      <Header />

      <main className="app-main">
        <div className="workbench">
          <section className="intro">
            <h1>Organize Your Receipts</h1>
            <p className="intro-copy">
              Instantly convert invoices into clear, categorized summaries.
            </p>
            <div className="intro-meta">
              <p>JPEG, PNG and WebP images.</p>
              <p>Processed locally in your browser, stored on this device.</p>
            </div>
          </section>

          <section className="drop-panel" {...getRootProps()}>
            <input {...getInputProps()} />
            {uploadedFiles.length === 0 ? (
              <div className="drop-inner">
                <Upload size={28} strokeWidth={1.5} aria-hidden="true" />
                <p className="drop-title">
                  {isDragActive ? "Drop the files here…" : "Drag and drop your receipts here"}
                </p>
                <p className="drop-hint">or click to select files</p>
                <div className="drop-actions">
                  <span className="btn btn-primary">Select Files</span>
                </div>
              </div>
            ) : (
              <div className="drop-list">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`file-row ${
                      file.status === "error"
                        ? "is-error"
                        : file.status === "receipt"
                          ? "is-receipt"
                          : ""
                    }`}
                  >
                    <span className="file-name">{file.name}</span>
                    {file.status === "processing" && (
                      <span className="file-status is-busy">
                        <LoaderCircle size={15} className="loader keep-motion" aria-hidden="true" />
                        Processing
                      </span>
                    )}
                    {file.status === "receipt" && (
                      <Tooltip content="Receipt data successfully extracted!">
                        <span className="file-status is-ok">
                          <Check size={15} aria-hidden="true" />
                          Extracted
                        </span>
                      </Tooltip>
                    )}
                    {file.status === "not-receipt" && (
                      <Tooltip content="No receipt data found in this image. Please try a clearer photo of your receipt.">
                        <span className="file-status is-warn">
                          <AlertTriangle size={15} aria-hidden="true" />
                          No data
                        </span>
                      </Tooltip>
                    )}
                    {file.status === "error" && (
                      <Tooltip content={`Processing failed: ${file.error || "Unknown error"}`}>
                        <span className="file-status is-bad">
                          <X size={15} aria-hidden="true" />
                          Failed
                        </span>
                      </Tooltip>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      className="icon-btn"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </div>
                ))}
                <div className="file-row">
                  <Upload size={15} aria-hidden="true" />
                  <span className="file-name">Upload more receipts</span>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="session-note" role="status">
          {uploadedFiles.length > 0 &&
            (allFilesProcessed ? (
              hasSuccessfulReceipts ? (
                countdown !== null ? (
                  <span className="session-note is-busy">
                    Opening results in {countdown} second{countdown !== 1 ? "s" : ""}…
                  </span>
                ) : (
                  <span className="session-note is-ok">
                    All files processed successfully. Opening results…
                  </span>
                )
              ) : (
                <span className="session-note is-error">
                  Some files failed to process. Please try again.
                </span>
              )
            ) : (
              <span>
                Processing files…{" "}
                {
                  uploadedFiles.filter((f) => f.status !== "processing")
                    .length
                }
                /{uploadedFiles.length} complete
              </span>
            ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
