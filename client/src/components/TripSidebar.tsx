import { useState, useMemo } from 'react';
import {
  Folder, FolderOpen, Plus, MoreHorizontal, Pencil, Trash2,
  MapPin, Calendar, X,
} from 'lucide-react';
import { useTripStore } from '../stores/trip-store';
import { useToast } from '../stores/toast-store';
import type { Trip } from '../../../shared/types';

interface TripSidebarProps {
  /** 移动端是否展开 */
  mobileOpen: boolean;
  /** 关闭移动端抽屉 */
  onCloseMobile: () => void;
}

export function TripSidebar({ mobileOpen, onCloseMobile }: TripSidebarProps) {
  const { trips, activeTripId, createTrip, switchTrip, deleteTrip, renameTrip } = useTripStore();
  const { show } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [menuId, setMenuId] = useState<string | null>(null);

  const handleCreate = () => {
    createTrip();
    onCloseMobile();
    show('已创建新旅程', 'success');
  };

  const handleSwitch = (id: string) => {
    if (id !== activeTripId) {
      switchTrip(id);
    }
    onCloseMobile();
  };

  const handleStartEdit = (trip: Trip) => {
    setEditingId(trip.id);
    setEditName(trip.name);
    setMenuId(null);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      renameTrip(editingId, editName.trim());
    }
    setEditingId(null);
  };

  const handleDelete = (trip: Trip) => {
    setMenuId(null);
    if (trip.items.length > 0) {
      if (!confirm(`「${trip.name}」包含 ${trip.items.length} 条行程，确定删除？`)) {
        return;
      }
    }
    deleteTrip(trip.id);
    show('旅程已删除', 'success');
  };

  // 每个旅程的摘要信息
  const tripSummaries = useMemo(() => {
    const map = new Map<string, { dateRange: string; count: number; cities: string[] }>();
    for (const trip of trips) {
      const count = trip.items.length;
      if (count === 0) {
        map.set(trip.id, { dateRange: '', count: 0, cities: [] });
        continue;
      }
      const sorted = [...trip.items].sort((a, b) => a.date.localeCompare(b.date));
      const startDate = sorted[0].date;
      const endDate = sorted[sorted.length - 1].date;
      const dateRange = startDate === endDate
        ? startDate.substring(5).replace('-', '/')
        : `${startDate.substring(5).replace('-', '/')} ~ ${endDate.substring(5).replace('-', '/')}`;
      const cities = [...new Set(trip.items.map((i) => i.city))].slice(0, 3);
      map.set(trip.id, { dateRange, count, cities });
    }
    return map;
  }, [trips]);

  const renderTripItem = (trip: Trip) => {
    const isActive = trip.id === activeTripId;
    const summary = tripSummaries.get(trip.id);
    const isEditing = editingId === trip.id;

    return (
      <div
        key={trip.id}
        className={`group relative rounded-paper transition-all cursor-pointer ${
          isActive
            ? 'bg-dawn-50 ring-1 ring-dawn-200'
            : 'hover:bg-paper-50'
        }`}
        onClick={() => !isEditing && handleSwitch(trip.id)}
      >
        <div className="flex items-start gap-2 p-2.5">
          {/* 文件夹图标 */}
          <div className="shrink-0 mt-0.5">
            {isActive ? (
              <FolderOpen size={18} className="text-dawn-500" />
            ) : (
              <Folder size={18} className="text-gray-400 group-hover:text-dawn-400" />
            )}
          </div>

          {/* 内容 */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={handleSaveEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') setEditingId(null);
                }}
                className="w-full text-sm font-medium text-gray-800 border-b border-dawn-300 outline-none bg-transparent"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className={`text-sm font-medium truncate ${
                isActive ? 'text-dawn-700' : 'text-gray-700'
              }`}>
                {trip.name}
              </div>
            )}

            {/* 摘要 */}
            {!isEditing && summary && (
              <div className="mt-0.5 space-y-0.5">
                {summary.count > 0 ? (
                  <>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Calendar size={10} />
                      {summary.dateRange}
                      <span className="text-gray-300">·</span>
                      {summary.count} 项
                    </div>
                    {summary.cities.length > 0 && (
                      <div className="flex items-center gap-1 text-[11px] text-gray-400 truncate">
                        <MapPin size={10} />
                        {summary.cities.join('、')}
                        {trip.items.length > 0 && [...new Set(trip.items.map(i => i.city))].length > 3 && ' 等'}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-[11px] text-gray-300">空旅程</div>
                )}
              </div>
            )}
          </div>

          {/* 操作菜单 */}
          {!isEditing && (
            <div className="shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuId(menuId === trip.id ? null : trip.id);
                }}
                className="p-1 rounded hover:bg-paper-200 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal size={14} className="text-gray-400" />
              </button>
              {menuId === trip.id && (
                <div className="absolute right-0 top-full mt-1 z-10 bg-white rounded-paper shadow-paper-hover border border-paper-200 py-1 w-28 animate-scale-in">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStartEdit(trip); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-600 hover:bg-paper-50"
                  >
                    <Pencil size={12} /> 重命名
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(trip); }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-storm-500 hover:bg-storm-500/5"
                  >
                    <Trash2 size={12} /> 删除
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* 头部 */}
      <div className="px-3 py-3 border-b border-paper-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">我的旅程</span>
          {/* 移动端关闭按钮 */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1 rounded hover:bg-paper-100"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>
        <button
          onClick={handleCreate}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-paper bg-dawn-50 hover:bg-dawn-100 text-dawn-600 text-sm font-medium transition-all border border-dawn-100 hover:border-dawn-200"
        >
          <Plus size={15} />
          新建旅程
        </button>
      </div>

      {/* 旅程列表 */}
      <div
        className="flex-1 overflow-y-auto px-2 py-2 space-y-1"
        onClick={() => setMenuId(null)}
      >
        {trips.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs">
            还没有旅程
          </div>
        ) : (
          trips.map(renderTripItem)
        )}
      </div>

      {/* 底部信息 */}
      <div className="px-3 py-2 border-t border-paper-200">
        <div className="text-[10px] text-gray-300 text-center">
          共 {trips.length} 段旅程
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 桌面端固定侧栏 */}
      <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-paper-200 bg-white/60 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* 移动端抽屉 */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 animate-fade-in">
          {/* 遮罩 */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={onCloseMobile}
          />
          {/* 抽屉 */}
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-paper-hover animate-slide-up">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
