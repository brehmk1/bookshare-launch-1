import { useEffect, useMemo, useRef, useState } from "react";
import { formatBytes, formatDateTime } from "./lib/format";
import { createDesktopAuthService } from "./services/desktop-auth-service";
import { createDesktopBackendAdapter } from "./services/desktop-linking-service";
import { createDesktopFileService } from "./services/desktop-file-service";
import { createDesktopPresenceService } from "./services/desktop-presence-service";
import type { DesktopPresenceState, DesktopSession, LocalFileRecord, WorkSummary } from "./types";

const authService = createDesktopAuthService();
const fileService = createDesktopFileService();
const backendAdapter = createDesktopBackendAdapter();
const presenceService = createDesktopPresenceService();

const phaseLabels = {
  available_later: "Available for transfer later",
  connected: "Connected",
  file_linked: "File linked",
  not_connected: "Not connected",
} as const;

export function App() {
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const [session, setSession] = useState<DesktopSession | null>(null);
  const [presence, setPresence] = useState<DesktopPresenceState | null>(null);
  const [files, setFiles] = useState<LocalFileRecord[]>([]);
  const [works, setWorks] = useState<WorkSummary[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("Desktop scaffold ready.");
  const [isScanning, setIsScanning] = useState(false);
  const [authDraft, setAuthDraft] = useState({
    email: "",
    role: "author" as "author" | "reader",
  });

  useEffect(() => {
    void (async () => {
      const [nextSession, nextPresence, nextWorks] = await Promise.all([
        authService.getSession(),
        presenceService.getState(),
        backendAdapter.listWorks(),
      ]);

      setSession(nextSession);
      setPresence(nextPresence);
      setWorks(nextWorks);
    })();
  }, []);

  const selectedFile = useMemo(
    () => files.find((file) => file.id === selectedFileId) ?? null,
    [files, selectedFileId],
  );

  async function handleConnect(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextSession = await authService.connect({
      email: authDraft.email,
      notes: "Local session only. Replace with real Supabase auth in Workstream 2B.",
      role: authDraft.role,
    });

    setSession(nextSession);
    setPresence(await presenceService.setStatus("connected", "Desktop scaffold connected locally."));
    setStatusMessage("Desktop auth scaffold connected locally.");
  }

  async function handleDisconnect() {
    const nextSession = await authService.disconnect();
    setSession(nextSession);
    setPresence(await presenceService.setStatus("not_connected", "Desktop scaffold disconnected."));
    setStatusMessage("Desktop auth scaffold disconnected.");
  }

  async function handleFolderSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFiles = event.target.files;

    if (!nextFiles?.length) {
      return;
    }

    setIsScanning(true);
    setStatusMessage(`Scanning ${nextFiles.length} local file(s)...`);

    try {
      const records = await fileService.scan(nextFiles);
      setFiles(records);
      setSelectedFileId(records[0]?.id ?? null);
      setPresence(
        await presenceService.setStatus(
          "connected",
          records.length
            ? `Scanned ${records.length} supported file(s).`
            : "No supported writing files were found in the selected folder.",
        ),
      );
      setStatusMessage(
        records.length
          ? `Discovered ${records.length} supported file(s) ready for linking.`
          : "No supported writing files were found. Supported types include txt, md, docx, pdf, and epub.",
      );
    } finally {
      setIsScanning(false);
      event.target.value = "";
    }
  }

  async function handleLinkWork(event: React.ChangeEvent<HTMLSelectElement>, fileId: string) {
    const workId = event.target.value;
    const file = files.find((item) => item.id === fileId);
    const work = works.find((item) => item.id === workId);

    if (!file || !work) {
      return;
    }

    const result = await backendAdapter.registerLinkedFile({
      fileFingerprint: file.fingerprint,
      localFileName: file.relativePath,
      mimeType: file.mimeType,
      size: file.size,
      workId: work.id,
    });

    const nextFiles: LocalFileRecord[] = files.map((item) =>
      item.id === fileId
        ? {
            ...item,
            availabilityStatus: "linked" as const,
            linkedWorkId: work.id,
            linkedWorkTitle: work.title,
          }
        : item,
    );

    setFiles(nextFiles);
    setPresence(await presenceService.setStatus("file_linked", result.detail));
    setStatusMessage(result.detail);
  }

  async function handleMarkAvailableLater() {
    if (!selectedFile) {
      return;
    }

    const nextFiles: LocalFileRecord[] = files.map((file) =>
      file.id === selectedFile.id
        ? {
            ...file,
            availabilityStatus: "ready_later" as const,
          }
        : file,
    );

    setFiles(nextFiles);
    setPresence(
      await presenceService.setStatus(
        "available_later",
        `${selectedFile.relativePath} is marked as ready for future transfer workflow integration.`,
      ),
    );
    setStatusMessage("Selected file marked as available for future transfer flow.");
  }

  return (
    <div className="desktop-shell">
      <aside className="desktop-sidebar">
        <div>
          <div className="desktop-brand">BookShare Desktop</div>
          <p className="desktop-subtitle">Local-only companion scaffold for authors and readers.</p>
        </div>

        <div className="status-card">
          <span className="status-label">Phase</span>
          <strong>{presence ? phaseLabels[presence.status] : "Loading"}</strong>
          <p>{presence?.detail ?? "Loading presence scaffold..."}</p>
        </div>

        <div className="status-card">
          <span className="status-label">Backend mode</span>
          <strong>{import.meta.env.VITE_BOOKSHARE_BACKEND_MODE ?? "mock"}</strong>
          <p>Workstream 2A uses a mockable adapter. Real backend file registration arrives in Workstream 2B.</p>
        </div>
      </aside>

      <main className="desktop-main">
        <section className="panel hero-panel">
          <div>
            <span className="eyebrow">Desktop companion</span>
            <h1>Keep manuscript files on the local machine while BookShare stays metadata-first.</h1>
            <p>
              This scaffold handles folder selection, supported file discovery, fingerprints, local metadata, and
              link-ready status. It does not transfer files yet.
            </p>
          </div>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => folderInputRef.current?.click()} type="button">
              Select local library folder
            </button>
            <button className="secondary-button" onClick={handleDisconnect} type="button">
              Reset local session
            </button>
          </div>
          <input
            ref={folderInputRef}
            className="hidden-input"
            type="file"
            multiple
            onChange={handleFolderSelection}
            {...({ webkitdirectory: "true", directory: "" } as Record<string, string>)}
          />
        </section>

        <div className="desktop-grid">
          <section className="panel">
            <div className="panel-header">
              <div>
                <span className="status-label">Auth scaffold</span>
                <h2>Desktop auth status</h2>
              </div>
            </div>

            <form className="desktop-form" onSubmit={handleConnect}>
              <label>
                Account email
                <input
                  placeholder="author@example.com"
                  type="email"
                  value={authDraft.email}
                  onChange={(event) => setAuthDraft((current) => ({ ...current, email: event.target.value }))}
                />
              </label>
              <label>
                Intended role
                <select
                  value={authDraft.role}
                  onChange={(event) =>
                    setAuthDraft((current) => ({
                      ...current,
                      role: event.target.value as "author" | "reader",
                    }))
                  }
                >
                  <option value="author">Author</option>
                  <option value="reader">Reader</option>
                </select>
              </label>
              <button className="primary-button" type="submit">
                Connect local scaffold session
              </button>
            </form>

            <div className="subtle-panel">
              <strong>{session?.authMode === "connected" ? "Connected locally" : "Placeholder only"}</strong>
              <p>{session?.notes ?? "Loading auth scaffold..."}</p>
              <p>{session?.email ? `Session email: ${session.email}` : "No account email linked yet."}</p>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <span className="status-label">File library</span>
                <h2>Discovered local files</h2>
              </div>
              <span className="stat-pill">{files.length} file(s)</span>
            </div>

            <div className="subtle-panel">
              <p>{isScanning ? "Scanning local files..." : statusMessage}</p>
            </div>

            <div className="file-list">
              {files.length ? (
                files.map((file) => (
                  <button
                    key={file.id}
                    className={`file-row ${selectedFileId === file.id ? "file-row-active" : ""}`}
                    onClick={() => setSelectedFileId(file.id)}
                    type="button"
                  >
                    <div>
                      <strong>{file.relativePath}</strong>
                      <span>
                        {formatBytes(file.size)} • {file.extension || "unknown"}
                      </span>
                    </div>
                    <span className="status-badge">{file.availabilityStatus}</span>
                  </button>
                ))
              ) : (
                <div className="empty-card">
                  <p>No local files scanned yet. Choose a folder to discover supported writing files.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="desktop-grid">
          <section className="panel">
            <div className="panel-header">
              <div>
                <span className="status-label">Selected file</span>
                <h2>Metadata and fingerprint</h2>
              </div>
            </div>

            {selectedFile ? (
              <div className="metadata-grid">
                <div className="metadata-item">
                  <span>File name</span>
                  <strong>{selectedFile.relativePath}</strong>
                </div>
                <div className="metadata-item">
                  <span>File size</span>
                  <strong>{formatBytes(selectedFile.size)}</strong>
                </div>
                <div className="metadata-item">
                  <span>MIME or extension</span>
                  <strong>{selectedFile.mimeType}</strong>
                </div>
                <div className="metadata-item">
                  <span>Last modified</span>
                  <strong>{formatDateTime(selectedFile.lastModified)}</strong>
                </div>
                <div className="metadata-item metadata-item-wide">
                  <span>Fingerprint</span>
                  <strong className="mono-text">{selectedFile.fingerprint}</strong>
                </div>
                <div className="metadata-item metadata-item-wide">
                  <span>Linked work</span>
                  <strong>{selectedFile.linkedWorkTitle ?? "Not linked yet"}</strong>
                </div>
              </div>
            ) : (
              <div className="empty-card">
                <p>Select a scanned file to inspect metadata.</p>
              </div>
            )}
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <span className="status-label">BookShare link</span>
                <h2>Associate local file to work</h2>
              </div>
            </div>

            {selectedFile ? (
              <div className="desktop-form">
                <label>
                  Existing BookShare work
                  <select
                    value={selectedFile.linkedWorkId ?? ""}
                    onChange={(event) => void handleLinkWork(event, selectedFile.id)}
                  >
                    <option value="">Choose a work record</option>
                    {works.map((work) => (
                      <option key={work.id} value={work.id}>
                        {work.title} • {work.genre}
                      </option>
                    ))}
                  </select>
                </label>

                <button className="secondary-button" onClick={() => void handleMarkAvailableLater()} type="button">
                  Mark as available for future transfer
                </button>

                <div className="subtle-panel">
                  <strong>Integration note</strong>
                  <p>
                    This uses a mock backend adapter in Workstream 2A. Workstream 2B should swap in real Supabase-backed
                    work lookup, client registration, file registration, and availability updates.
                  </p>
                </div>
              </div>
            ) : (
              <div className="empty-card">
                <p>Scan a folder and select a file before linking it to a BookShare work.</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
