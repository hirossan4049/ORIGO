'use client'

interface FileContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onDeleteFile: () => void;
}

export function FileContextMenu({ x, y, onClose, onDeleteFile }: FileContextMenuProps) {
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
          className="p-2 hover:bg-gray-100 rounded-md cursor-pointer text-sm text-red-600"
          onClick={onDeleteFile}
        >
          Delete File
        </li>
      </ul>
    </div>
  );
}
