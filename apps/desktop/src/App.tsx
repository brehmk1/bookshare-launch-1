import { useEffect, useMemo, useRef, useState } from "react";
import { getDesktopEnv } from "./lib/env";
import { formatBytes, formatDateTime } from "./lib/format";
import { createDesktopBackendService } from "./services/desktop-backend-service";
import { createDesktopFileService } from "./services/desktop-file-service";
import type { DesktopPresenceState, DesktopSession, LocalFileRecord, WorkSummary } from "./types";

const backendService = createDesktopBackendService();
const fileService = createDesktopFileService();
const desktopEnv = getDesktopEnv();

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
  const [statusMessage, setStatusMessage] = useState("Desktop backend ready.");
  const [isScanning, setIsScanning] = useState(false);
  const [authDraft, setAuthDraft] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    void (async () => {
      try {
        const [nextSession, nextPresence, nextWorks] = await Promise.all([
          backendService.getSession(),
          backendService.getPresence(),
          backendService.listWorks(),
        ]);

        setSession(nextSession);
        setPresence(nextPresence);
        setWorks(nextWorks);
        setStatusMessage(
          nextSession.userId
            ? "Restored BookShare desktop session and loaded live backend data."
            : "Sign in with your existing BookShare account to register desktop files.",
        );
      } catch (error) {
        setStatusMessage(error instanceof Error ? error.message : "Unable to initialize the desktop backend.");
      }
    })();
  }, []);

  const selectedFile = useMemo(
    () => files.find((file) => file.id === selectedFileId) ?? null,
    [files, selectedFileId],
  );

  async function handleConnect(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("Connecting to BookShare...");

    try {
      const snapshot = await backendService.connect({
        email: authDraft.email,
        password: authDraft.password,
      });

      setSession(snapshot.session);
      setPresence({
        client: snapshot.client,
        detail: snapshot.client
          ? `Desktop client ${snapshot.client.deviceName} registered successfully.`
          : "Desktop client registration is pending.",
        status: "connected",
      });
      setWorks(snapshot.works);
      setStatusMessage(
        snapshot.session.role === "reader"
          ? "Signed in as a reader. Desktop registration is live, but file linking remains author-focused."
          : snapshot.works.length
            ? "Signed in successfully and loaded your authored BookShare works."
            : "Signed in successfully. No authored works were found yet in the backend.",
      );
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to sign in to BookShare.");
    }
  }

  async function handleDisconnect() {
    try {
      const nextSession = await backendService.disconnect();
      setSession(nextSession);
      setPresence({
        client: null,
        detail: "Desktop session disconnected and client set offline.",
        status: "not_connected",
      });
      setWorks([]);
      setStatusMessage("Desktop session disconnected.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to disconnect cleanly.");
    }
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
      setPresence((current) => ({
        client: current?.client ?? null,
        detail: records.length
          ? `Scanned ${records.length} supported file(s).`
          : "No supported writing files were found in the selected folder.",
        status: current?.client ? "connected" : "not_connected",
      }));
      setStatusMessage(
        records.length
          ? `Discovered ${records.length} supported file(s) ready for backend linking.`
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

    if (!presence?.client?.id) {
      setStatusMessage("Sign in and register the desktop client before linking files.");
      return;
    }

    try {
      const result = await backendService.registerLinkedFile({
        availabilityStatus: "linked",
        desktopClientId: presence.client.id,
        fileFingerprint: file.fingerprint,
        lastSeenAt: new Date().toISOString(),
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
      setPresence({
        client: presence.client,
        detail: result.detail,
        status: "file_linked",
      });
      setStatusMessage(result.detail);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to register the selected file.");
    }
  }

  async function handleMarkAvailableLater() {
    if (!selectedFile) {
      return;
    }

    if (!presence?.client?.id) {
      setStatusMessage("Sign in and register the desktop client before updating availability.");
      return;
    }

    if (!selectedFile.linkedWorkId) {
      setStatusMessage("Link the file to a BookShare work before marking it available.");
      return;
    }

    try {
      const detail = await backendService.setAvailability({
        availabilityStatus: "ready_later",
        desktopClientId: presence.client.id,
        fileFingerprint: selectedFile.fingerprint,
        lastSeenAt: new Date().toISOString(),
      });

      const nextFiles: LocalFileRecord[] = files.map((file) =>
        file.id === selectedFile.id
          ? {
              ...file,
              availabilityStatus: "ready_later" as const,
            }
          : file,
      );

      setFiles(nextFiles);
      setPresence({
        client: presence.client,
        detail: detail.detail,
        status: "available_later",
      });
      setStatusMessage(detail.detail);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Unable to update availability.");
    }
  }

  return (
    <div className="desktop-shell">
      <aside className="desktop-sidebar">
        <div>
          <div className="desktop-brand">BookShare Desktop</div>
          <p className="desktop-subtitle">Local-first file registration for the live BookShare backend.</p>
        </div>

        <div className="status-card">
          <span className="status-label">Phase</span>
          <strong>{presence ? phaseLabels[presence.status] : "Loading"}</strong>
          <p>{presence?.detail ?? "Loading desktop presence..."}</p>
        </div>

        <div className="status-card">
          <span className="status-label">Backend mode</span>
          <strong>{desktopEnv.backendMode}</strong>
          <p>
            {desktopEnv.configured
              ? "Desktop backend env vars are configured for live Supabase access."
              : "Desktop Supabase env vars are missing. Add them before attempting sign-in."}
          </p>
        </div>
      </aside>

      <main className="desktop-main">
        <section className="panel hero-panel">
          <div>
            <span className="eyebrow">Desktop companion</span>
            <h1>Register local writing files without moving manuscript storage into the platform.</h1>
            <p>
              This phase connects the desktop scaffold to BookShare for sign-in, desktop client presence, authored-work
              lookup, file registration, and availability status updates.
            </p>
          </div>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => folderInputRef.current?.click()} type="button">
              Select local library folder
            </button>
            <button className="secondary-button" onClick={handleDisconnect} type="button">
              Sign out desktop
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
                <span className="status-label">Desktop sign-in</span>
                <h2>BookShare account</h2>
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
                Password
                <input
                  placeholder="Use your existing BookShare password"
                  type="password"
                  value={authDraft.password}
                  onChange={(event) => setAuthDraft((current) => ({ ...current, password: event.target.value }))}
                />
              </label>
              <button className="primary-button" type="submit">
                Sign in to BookShare
              </button>
            </form>

            <div className="subtle-panel">
              <strong>{session?.authMode === "connected" ? "Connected to BookShare" : "Awaiting sign-in"}</strong>
              <p>{session?.notes ?? "Loading desktop session..."}</p>
              <p>{session?.email ? `Session email: ${session.email}` : "No account email linked yet."}</p>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <span className="status-label">Local library</span>
                <h2>Discovered writing files</h2>
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
                        {formatBytes(file.size)} | {file.extension || "unknown"}
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
                <span className="status-label">Live backend link</span>
                <h2>Associate local file to BookShare work</h2>
              </div>
            </div>

            {selectedFile ? (
              <div className="desktop-form">
                <label>
                  Existing authored work
                  <select
                    value={selectedFile.linkedWorkId ?? ""}
                    onChange={(event) => void handleLinkWork(event, selectedFile.id)}
                  >
                    <option value="">Choose a work record</option>
                    {works.map((work) => (
                      <option key={work.id} value={work.id}>
                        {work.title} - {work.genre}
                      </option>
                    ))}
                  </select>
                </label>

                <button className="secondary-button" onClick={() => void handleMarkAvailableLater()} type="button">
                  Mark as available for transfer later
                </button>

                <div className="subtle-panel">
                  <strong>Integration note</strong>
                  <p>
                    This now uses the live BookShare backend for desktop client registration, authored-work lookup,
                    `work_files` upserts, and availability updates. File transfer is still intentionally not implemented.
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
