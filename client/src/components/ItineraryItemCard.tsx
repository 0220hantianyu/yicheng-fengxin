import { useState } from 'react';
import { Pencil, Trash2, MapPin, Clock, FileText, Loader2, CalendarClock } from 'lucide-react';
import type { ItineraryItem } from '../../../shared/types';
import { TIME_SLOT_LABELS } from '../utils/time-slot';
import { formatDateChinese, classifyDate, getDateCategoryLabel } from '../utils/date';
import { WeatherCard } from './WeatherCard';

interface ItineraryItemCardProps {
  item: ItineraryItem;
  onEdit: () => void;
  onDelete: () => void;
  onRefreshWeather: () => void;
  refreshing: boolean;
  onClearDatePending?: () => void;
}

export function ItineraryItemCard({ item, onEdit, onDelete, onRefreshWeather, refreshing, onClearDatePending }: ItineraryItemCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const dateCategory = classifyDate(item.date);

  return (
    <div className={`card card-hover p-3.5 animate-fade-in ${item.datePending ? 'border border-warm-300 bg-warm-50/30' : ''}`}>
      {/* 顶部信息 */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {/* 日期 + 时段 */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-800">
              {formatDateChinese(item.date)}
            </span>
            <span className="tag bg-dawn-50 text-dawn-600">
              <Clock size={10} /> {TIME_SLOT_LABELS[item.timeSlot]}
            </span>
            {item.datePending && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onClearDatePending) onClearDatePending();
                  else onEdit();
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-warm-100 text-warm-700 text-xs hover:bg-warm-200 transition-colors"
                title="点击修改日期"
              >
                <CalendarClock size={10} />
                日期待补充
              </button>
            )}
            {dateCategory !== 'near' && !item.datePending && (
              <span className="tag bg-paper-100 text-gray-500">
                {getDateCategoryLabel(dateCategory)}
              </span>
            )}
          </div>

          {/* 城市 */}
          <div className="flex items-center gap-1.5 mt-1 text-gray-700">
            <MapPin size={14} className="text-dawn-400 shrink-0" />
            <span className="font-medium">
              {item.city}
              {item.district && <span className="text-gray-500 ml-0.5">·{item.district}</span>}
            </span>
          </div>

          {/* 备注 */}
          {item.note && (
            <div className="flex items-start gap-1.5 mt-1 text-sm text-gray-500">
              <FileText size={13} className="text-gray-400 shrink-0 mt-0.5" />
              <span>{item.note}</span>
            </div>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-dawn-500 hover:bg-paper-50 rounded-paper transition-all"
            title="编辑"
          >
            <Pencil size={15} />
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => { onDelete(); setConfirmDelete(false); }}
                className="px-2 py-1 text-xs bg-storm-500 text-white rounded-paper"
              >
                确认删除
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-1 text-xs bg-paper-100 text-gray-500 rounded-paper"
              >
                取消
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 text-gray-400 hover:text-storm-500 hover:bg-paper-50 rounded-paper transition-all"
              title="删除"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

      {/* 天气卡片 */}
      <WeatherCard
        item={item}
        onRefresh={onRefreshWeather}
        refreshing={refreshing}
      />
    </div>
  );
}
