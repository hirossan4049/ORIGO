'use client'

interface ProjectContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onAddFile: () => void;
  onDeleteProject: () => void;
}

export function ProjectContextMenu({ x, y, onClose, onAddFile, onDeleteProject }: ProjectContextMenuProps) {
  return (
    <div
      className="fixed z-50 bg-white shadow-lg rounded-md p-2 border border-gray-200"
      style={{ top: y, left: x }}
      onClick={onClose}
      onContextMenu={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <ul>
        <li
          className="p-2 hover:bg-gray-100 rounded-md cursor-pointer text-sm"
          onClick={onAddFile}
        >
          Add File
        </li>
        <li
          className="p-2 hover:bg-gray-100 rounded-md cursor-pointer text-sm text-red-600"
          onClick={onDeleteProject}
        >
          Delete Project
        </li>
      </ul>
    </div>
  );
}
