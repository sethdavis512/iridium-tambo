import { StickyNoteIcon } from 'lucide-react';

interface NoteItem {
    title?: string;
    content?: string;
}

interface NotesGalleryProps {
    title?: string;
    notes?: NoteItem[];
}

export function NotesGallery({ title, notes = [] }: NotesGalleryProps) {
    return (
        <div className="mt-2">
            {title && <h3 className="mb-2 font-semibold">{title}</h3>}
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {notes.map((note, i) => (
                    <div
                        key={i}
                        className="rounded-box border-base-300 bg-base-200 border p-3"
                    >
                        <div className="mb-1 flex items-center gap-1.5">
                            <StickyNoteIcon
                                className="text-warning h-4 w-4 shrink-0"
                                aria-hidden="true"
                            />
                            <span className="truncate text-sm font-medium">
                                {note.title ?? 'Untitled'}
                            </span>
                        </div>
                        {note.content && (
                            <p className="text-base-content/60 line-clamp-3 text-xs">
                                {note.content}
                            </p>
                        )}
                    </div>
                ))}
                {notes.length === 0 && (
                    <p className="text-base-content/40 col-span-full text-center text-sm">
                        No notes to display.
                    </p>
                )}
            </div>
        </div>
    );
}
