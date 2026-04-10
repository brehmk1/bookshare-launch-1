import { createFileFingerprint } from "../lib/fingerprint";
import { slugifyFileId } from "../lib/format";
import type { LocalFileRecord } from "../types";

const supportedExtensions = new Set([
  ".doc",
  ".docx",
  ".epub",
  ".md",
  ".odt",
  ".pdf",
  ".rtf",
  ".tex",
  ".txt",
]);

function getExtension(name: string) {
  const index = name.lastIndexOf(".");
  return index >= 0 ? name.slice(index).toLowerCase() : "";
}

function getMimeType(file: File, extension: string) {
  if (file.type) {
    return file.type;
  }

  return extension ? `application/${extension.replace(".", "")}` : "application/octet-stream";
}

export interface DesktopFileService {
  scan(files: FileList | File[]): Promise<LocalFileRecord[]>;
}

export function createDesktopFileService(): DesktopFileService {
  return {
    async scan(fileCollection) {
      const files = Array.from(fileCollection);
      const supportedFiles = files.filter((file) => supportedExtensions.has(getExtension(file.name)));

      const records = await Promise.all(
        supportedFiles.map(async (file) => {
          const extension = getExtension(file.name);

          return {
            availabilityStatus: "unlinked",
            extension,
            file,
            fingerprint: await createFileFingerprint(file),
            id: slugifyFileId(file.name, file.lastModified),
            lastModified: new Date(file.lastModified).toISOString(),
            linkedWorkId: null,
            linkedWorkTitle: null,
            mimeType: getMimeType(file, extension),
            relativePath: (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name,
            size: file.size,
          } satisfies LocalFileRecord;
        }),
      );

      return records.sort((left, right) => left.relativePath.localeCompare(right.relativePath));
    },
  };
}
