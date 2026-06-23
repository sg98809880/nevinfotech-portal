"use client";

import { useCallback, useRef, useState } from "react";
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE_BYTES, type FileRecord } from "@/types";
import { formatBytes, formatDate } from "@/lib/utils";

type QueueItem = {
  localId: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "saving" | "done" | "error";
  error?: string;
};

const ACCEPTED_EXTENSIONS = Object.values(ACCEPTED_FILE_TYPES).join(", ");

export function FileUploader({
  companyId,
  initialFiles,
}: {
  companyId: string;
  initialFiles: FileRecord[];
}) {
  const [files, setFiles] = useState<FileRecord[]>(initialFiles);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateQueueItem = useCallback((localId: string, patch: Partial<QueueItem>) => {
    setQueue((q) => q.map((item) => (item.localId === localId ? { ...item, ...patch } : item)));
  }, []);

  async function uploadOne(item: QueueItem) {
    const { file, localId } = item;

    if (!ACCEPTED_FILE_TYPES[file.type]) {
      updateQueueItem(localId, { status: "error", error: "Unsupported file type." });
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      updateQueueItem(localId, { status: "error", error: "File exceeds 25 MB." });
      return;
    }

    try {
      // 1. Ask the server for a presigned R2 upload URL.
      const presignRes = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });
      const presignBody = await presignRes.json();
      if (!presignRes.ok) throw new Error(presignBody.error ?? "Could not get upload URL.");

      const { fileId, fileKey, uploadUrl } = presignBody;

      // 2. PUT the file directly to Cloudflare R2, tracking progress.
      updateQueueItem(localId, { status: "uploading" });
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            updateQueueItem(localId, { progress: Math.round((e.loaded / e.total) * 100) });
          }
        };
        xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error("Upload to R2 failed.")));
        xhr.onerror = () => reject(new Error("Upload to R2 failed."));
        xhr.send(file);
      });

      // 3. Persist file metadata in Supabase.
      updateQueueItem(localId, { status: "saving" });
      const confirmRes = await fetch("/api/upload/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          fileId,
          fileKey,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });
      const confirmBody = await confirmRes.json();
      if (!confirmRes.ok) throw new Error(confirmBody.error ?? "Could not save file metadata.");

      updateQueueItem(localId, { status: "done", progress: 100 });
      setFiles((f) => [confirmBody.file, ...f]);
    } catch (err) {
      updateQueueItem(localId, { status: "error", error: err instanceof Error ? err.message : "Upload failed." });
    }
  }

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const items: QueueItem[] = Array.from(fileList).map((file) => ({
      localId: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: "pending",
    }));
    setQueue((q) => [...items, ...q]);
    items.forEach((item) => uploadOne(item));
  }

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors ${
          dragOver
            ? "border-gold-500 bg-gold-50 dark:bg-gold-900/10"
            : "border-ink-200 dark:border-ink-700 hover:border-gold-400"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_EXTENSIONS}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 text-ink-400">
          <path d="M12 16V4M12 4l-4 4M12 4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-sm font-medium text-ink-700 dark:text-ink-200">
          Drag files here, or click to browse
        </p>
        <p className="mt-1 text-xs text-ink-400">PDF, DOCX, XLSX, PNG, JPG — up to 25 MB each</p>
      </div>

      {queue.length > 0 && (
        <div className="space-y-2">
          {queue.map((item) => (
            <div
              key={item.localId}
              className="flex items-center gap-3 rounded-md border border-ink-100 dark:border-ink-800 bg-[rgb(var(--surface))] px-4 py-3"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm font-medium text-ink-700 dark:text-ink-200">{item.file.name}</span>
                  <span className="ml-2 shrink-0 text-xs text-ink-400">{formatBytes(item.file.size)}</span>
                </div>
                {item.status === "error" ? (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{item.error}</p>
                ) : (
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink-100 dark:bg-ink-800">
                    <div
                      className={`h-full rounded-full transition-all ${item.status === "done" ? "bg-emerald-500" : "bg-gold-500"}`}
                      style={{ width: `${item.status === "done" ? 100 : item.progress}%` }}
                    />
                  </div>
                )}
              </div>
              <StatusStamp status={item.status} />
            </div>
          ))}
        </div>
      )}

      <div>
        <h3 className="mb-3 font-display text-sm font-semibold text-ink-700 dark:text-ink-200">
          Uploaded files ({files.length})
        </h3>
        {files.length === 0 ? (
          <p className="rounded-md border border-dashed border-ink-200 dark:border-ink-700 px-4 py-6 text-center text-sm text-ink-400">
            No files yet. Anything you upload above lands in this company's record.
          </p>
        ) : (
          <ul className="divide-y divide-ink-100 dark:divide-ink-800 rounded-md border border-ink-100 dark:border-ink-800 ledger-rule">
            {files.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink-700 dark:text-ink-200">{f.file_name}</p>
                  <p className="font-mono text-xs text-ink-400">
                    {formatBytes(f.size)} · {formatDate(f.created_at)}
                  </p>
                </div>
                <span className="stamp shrink-0 border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  Stored
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatusStamp({ status }: { status: QueueItem["status"] }) {
  const map: Record<QueueItem["status"], { label: string; cls: string }> = {
    pending: { label: "Queued", cls: "border-ink-300 bg-ink-50 text-ink-600 dark:border-ink-600 dark:bg-ink-800 dark:text-ink-300" },
    uploading: { label: "Uploading", cls: "border-gold-300 bg-gold-50 text-gold-700 dark:border-gold-700 dark:bg-gold-900/30 dark:text-gold-400" },
    saving: { label: "Saving", cls: "border-gold-300 bg-gold-50 text-gold-700 dark:border-gold-700 dark:bg-gold-900/30 dark:text-gold-400" },
    done: { label: "Stored", cls: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    error: { label: "Failed", cls: "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-400" },
  };
  const s = map[status];
  return <span className={`stamp shrink-0 border ${s.cls}`}>{s.label}</span>;
}
