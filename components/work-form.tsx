import { createWorkAction, updateWorkAction } from "@/lib/actions/works";
import type { WorkRow } from "@/types/database";

interface WorkPrefill {
  draftExcerpt?: string | null;
  draftGenre?: string | null;
  draftTitle?: string | null;
}

interface WorkFormProps {
  draft?: WorkPrefill;
  mode: "create" | "edit";
  work?: WorkRow;
}

export function WorkForm({ mode, work, draft }: WorkFormProps) {
  const action = mode === "create" ? createWorkAction : updateWorkAction;
  const titleValue = work?.title ?? draft?.draftTitle ?? "";
  const genreValue = work?.genre ?? draft?.draftGenre ?? "";
  const excerptValue = work?.excerpt_text ?? draft?.draftExcerpt ?? "";

  return (
    <form action={action} className="surface-form">
      {work ? <input type="hidden" name="work_id" value={work.id} /> : null}

      <div className="form-grid">
        <div>
          <label htmlFor="title">Title</label>
          <input id="title" name="title" defaultValue={titleValue} placeholder="Title of your work" required />
        </div>

        <div>
          <label htmlFor="genre">Genre</label>
          <input id="genre" name="genre" defaultValue={genreValue} placeholder="Fantasy, memoir, literary fiction..." required />
        </div>

        <div className="form-span-2">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            defaultValue={work?.description ?? ""}
            placeholder="Describe the work, what readers can expect, and why it stands out."
            required
          />
        </div>

        <div className="form-span-2">
          <label htmlFor="tags">Tags</label>
          <input
            id="tags"
            name="tags"
            defaultValue={work?.tags.join(", ") ?? ""}
            placeholder="Comma-separated tags, like found family, gothic, fast-paced"
          />
        </div>

        <div className="form-span-2">
          <label htmlFor="excerpt_text">Excerpt text</label>
          <textarea
            id="excerpt_text"
            name="excerpt_text"
            defaultValue={excerptValue}
            placeholder="Paste an opening scene, chapter, or excerpt."
            required
          />
        </div>

        <div>
          <label htmlFor="cover_image_url">Optional cover image URL</label>
          <input
            id="cover_image_url"
            name="cover_image_url"
            defaultValue={work?.cover_image_url ?? ""}
            placeholder="https://example.com/cover.jpg"
          />
        </div>

        <div>
          <label htmlFor="visibility">Visibility</label>
          <select id="visibility" name="visibility" defaultValue={work?.visibility ?? "public"}>
            <option value="public">Public listing</option>
            <option value="private">Private draft</option>
          </select>
        </div>

        <div>
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={work?.status ?? "published"}>
            <option value="published">Published listing</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="checkbox-row">
          <input
            id="featured_flag"
            name="featured_flag"
            type="checkbox"
            defaultChecked={work?.featured_flag ?? false}
          />
          <label htmlFor="featured_flag">Mark as featured-ready for promotion</label>
        </div>
      </div>

      <button type="submit" className="primary-button">
        {mode === "create" ? "Create work" : "Save changes"}
      </button>
    </form>
  );
}
