import React, { useState } from 'react';
import { GripVertical, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';

interface DraggableItemProps {
  id: string;
  index: number;
  total: number;
  onMove: (direction: 'up' | 'down') => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
  onDelete?: () => void;
  title: React.ReactNode;
  children: React.ReactNode;
  dragType?: string;
  className?: string;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  id,
  index,
  total,
  onMove,
  onReorder,
  onDelete,
  title,
  children,
  dragType = 'cv-item',
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', JSON.stringify({ index, type: dragType }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only reset if leaving this container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data && data.type === dragType && typeof data.index === 'number') {
        if (data.index !== index) {
          onReorder(data.index, index);
        }
      }
    } catch (err) {
      console.error('Error handling drop', err);
    }
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-xl border transition-all duration-150 ${
        isDragging
          ? 'opacity-40 border-dashed border-blue-400 bg-blue-50/20'
          : isDragOver
          ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20 scale-[1.01]'
          : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
      } ${className}`}
    >
      {/* Top Bar with Drag Handle & Actions */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200/80 bg-white/60 rounded-t-xl gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="cursor-grab active:cursor-grabbing p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors shrink-0"
            title="Glisser-déposer pour réordonner"
          >
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="text-xs font-bold text-slate-700 truncate">{title}</div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onMove('up')}
            disabled={index === 0}
            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-25 disabled:hover:text-slate-400 rounded transition-colors"
            title="Monter"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onMove('down')}
            disabled={index === total - 1}
            className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-25 disabled:hover:text-slate-400 rounded transition-colors"
            title="Descendre"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors ml-1"
              title="Supprimer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Item Content */}
      <div className="p-4">{children}</div>
    </div>
  );
};
