import { useState, useMemo } from 'react';
import type { ItineraryItem } from '../../../shared/types';
import { groupByDate } from '../utils/time-slot';
import { formatDateChinese, classifyDate, getDateCategoryLabel } from '../utils/date';
import { ItineraryItemCard } from './ItineraryItemCard';
import { CalendarDays, ChevronDown, ChevronRight, Archive } from 'lucide-react';

interface TimelineProps {
  items: ItineraryItem[];
  onEdit: (item: ItineraryItem) => void;
  onDelete: (id: string) => void;
  onRefreshWeather: (item: ItineraryItem) => void;
  refreshingIds: Set<string>;
  onClearDatePending?: (id: string) => void;
}

type FilterTab = 'all' | 'active' | 'past';

export function Timeline({ items, onEdit, onDelete, onRefreshWeather, refreshingIds, onClearDatePending }: TimelineProps) {
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [pastExpanded, setPastExpanded] = useState(false);

  // 按日期分类：未来/今天 vs 过去
  const { activeItems, pastItems } = useMemo(() => {
    const active: ItineraryItem[] = [];
    const past: ItineraryItem[] = [];
    for (const item of items) {
      const cat = classifyDate(item.date);
      if (cat === 'past') {
        past.push(item);
      } else {
        active.push(item);
      }
    }
    return { activeItems: active, pastItems: past };
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <CalendarDays size={48} className="text-paper-300 mb-3" />
        <p className="text-gray-400 text-sm">还没有行程，点击上方按钮添加</p>
      </div>
    );
  }

  // 根据 tab 筛选
  let displayItems: ItineraryItem[];
  if (filterTab === 'active') {
    displayItems = activeItems;
  } else if (filterTab === 'past') {
    displayItems = pastItems;
  } else {
    displayItems = items;
  }

  // 按 hasItems 检查
  const hasActive = activeItems.length > 0;
  const hasPast = pastItems.length > 0;

  // 渲染一组日期分组
  function renderDateGroups(groupItems: ItineraryItem[]) {
    const grouped = groupByDate(groupItems);
    const sortedDates = [...grouped.keys()].sort();

    return (
      <div className="space-y-5">
        {sortedDates.map((date) => {
          const dayItems = grouped.get(date)!;
          const category = classifyDate(date);

          return (
            <div key={date}>
              {/* 日期分隔标题 */}
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="h-px flex-1 bg-paper-200" />
                <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
                  <CalendarDays size={12} className="text-dawn-400" />
                  {formatDateChinese(date)}
                  {category !== 'near' && (
                    <span className="text-gray-400">· {getDateCategoryLabel(category)}</span>
                  )}
                </span>
                <div className="h-px flex-1 bg-paper-200" />
              </div>

              {/* 当天行程项 */}
              <div className="space-y-2.5">
                {dayItems.map((item) => (
                  <ItineraryItemCard
                    key={item.id}
                    item={item}
                    onEdit={() => onEdit(item)}
                    onDelete={() => onDelete(item.id)}
                    onRefreshWeather={() => onRefreshWeather(item)}
                    refreshing={refreshingIds.has(item.id)}
                    onClearDatePending={onClearDatePending ? () => onClearDatePending(item.id) : undefined}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 筛选 Tab */}
      {(hasActive && hasPast) && (
        <div className="flex items-center gap-1 bg-paper-50 rounded-paper p-1">
          {([
            { key: 'all' as const, label: `全部 ${items.length}` },
            { key: 'active' as const, label: `进行中 ${activeItems.length}` },
            { key: 'past' as const, label: `已结束 ${pastItems.length}` },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterTab(tab.key)}
              className={`flex-1 text-xs py-1.5 px-2 rounded-paper transition-all font-medium ${
                filterTab === tab.key
                  ? 'bg-white text-dawn-600 shadow-paper'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* 进行中 / 未来行程 */}
      {hasActive && filterTab !== 'past' && renderDateGroups(activeItems)}

      {/* 已结束行程（折叠区） */}
      {hasPast && filterTab !== 'active' && (
        <div>
          {/* 折叠切换条 */}
          {filterTab === 'all' && (
            <button
              onClick={() => setPastExpanded(!pastExpanded)}
              className="w-full flex items-center gap-2 px-3 py-2 bg-paper-50 hover:bg-paper-100 rounded-paper transition-all text-sm text-gray-500"
            >
              {pastExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              <Archive size={14} className="text-gray-400" />
              <span>已结束行程（{pastItems.length} 条）</span>
              {!pastExpanded && (
                <span className="text-xs text-gray-400 ml-auto">点击展开</span>
              )}
            </button>
          )}

          {/* 展开内容 */}
          {(pastExpanded || filterTab === 'past') && (
            <div className="mt-2 opacity-75">
              {renderDateGroups(pastItems)}
            </div>
          )}
        </div>
      )}

      {/* 空状态（筛选后无内容） */}
      {displayItems.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">
          {filterTab === 'active' ? '没有进行中的行程' : '没有已结束的行程'}
        </div>
      )}
    </div>
  );
}
