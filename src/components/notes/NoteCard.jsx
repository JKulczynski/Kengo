import React, { useState } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Mic, Trash2, FolderOpen } from "lucide-react";

export default function NoteCard({ note, project, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const PREVIEW_LENGTH = 140;
  const hasMore = note.content?.length > PREVIEW_LENGTH;
  const displayText =
    expanded || !hasMore
      ? note.content
      : note.content?.slice(0, PREVIEW_LENGTH) + "...";

  return (
    <div className="apple-blur apple-shadow rounded-2xl p-5 flex flex-col gap-3 hover:apple-shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 mb-1">
            {format(new Date(note.created_date), "d MMM yyyy, HH:mm", {
              locale: pl,
            })}
          </p>
          {note.title && (
            <h3 className="font-medium text-black text-sm">{note.title}</h3>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {note.audio_url && (
            <span className="flex items-center gap-1 text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full font-medium">
              <Mic className="w-3 h-3" />
              Audio
            </span>
          )}
          <button
            onClick={() => onDelete(note.id)}
            className="text-gray-300 hover:text-red-400 transition-colors p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {note.content && (
        <p className="text-sm text-gray-600 leading-relaxed">
          {displayText}
          {hasMore && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-1 text-blue-500 text-xs font-medium"
            >
              {expanded ? "mniej" : "więcej"}
            </button>
          )}
        </p>
      )}

      {note.audio_url && (
        <audio
          controls
          src={note.audio_url}
          className="w-full mt-1"
          style={{ height: "36px" }}
        />
      )}

      {project && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-1 border-t border-gray-100">
          <FolderOpen className="w-3 h-3" />
          <span>{project.name}</span>
        </div>
      )}
    </div>
  );
}
