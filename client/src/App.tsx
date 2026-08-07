import { useState, useEffect, useRef } from 'react';
import {
  Plus, Download, Copy, Wind, RefreshCw,
  MoreVertical, X, Menu,
} from 'lucide-react';
import { useTripStore } from './stores/trip-store';
import { useToast } from './stores/toast-store';
import { api } from './services/api';
import { TripSidebar } from './components/TripSidebar';
import { Timeline } from './components/Timeline';
import { ItineraryForm } from './components/ItineraryForm';
import { ExportDialog } from './components/ExportDialog';
import { ToastContainer } from './components/Toast';
import { generateWeatherSummary } from './utils/weather-rules';
import { classifyDate, isWeatherStale } from './utils/date';
import { generateReminders } from './utils/weather-rules';
import type { ItineraryItem } from '../../shared/types';

export default function App() {
  const {
    trips, activeTripId, isMockMode,
    setMockMode, createTrip, renameTrip,
    addItem, updateItem, deleteItem, updateWeather,
  } = useTripStore();
  const { show } = useToast();

  // 活跃旅程
  const activeTrip = trips.find((t) => t.id === activeTripId);
  const items = activeTrip?.items ?? [];
  const tripName = activeTrip?.name ?? '我的旅程';

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [refreshingIds, setRefreshingIds] = useState<Set<string>>(new Set());
  const [refreshingAll, setRefreshingAll] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  // 用 ref 保持最新的 items，避免 useEffect 闭包陈旧
  const itemsRef = useRef(items);
  itemsRef.current = items;

  // 首次加载：如果没有旅程，自动创建一个
  useEffect(() => {
    if (trips.length === 0) {
      createTrip('我的旅程');
    }
  }, []);

  // 并发控制：最多同时 3 个请求
  const fetchWeatherBatch = async (targets: { itemId: string; location: { locationId: string; lat: string; lon: string } }[]) => {
    if (targets.length === 0) return;
    const CONCURRENCY = 3;
    let index = 0;

    const runNext = async (): Promise<void> => {
      while (index < targets.length) {
        const { itemId, location } = targets[index++];
        setRefreshingIds(prev => new Set(prev).add(itemId));
        try {
          const { data, mock } = await api.getForecast(location.locationId, location.lat, location.lon);
          updateWeather(itemId, data);
          setMockMode(mock);
        } catch (err) {
          console.error('Weather fetch error:', err);
        } finally {
          setRefreshingIds(prev => {
            const next = new Set(prev);
            next.delete(itemId);
            return next;
          });
        }
      }
    };

    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, targets.length) }, () => runNext()));
  };

  // 页面加载/切换旅程时：检查服务状态 + 自动刷新过时/mock 数据
  useEffect(() => {
    if (!activeTripId) return;

    api.getStatus().then((status) => {
      setMockMode(status.mock);
      if (status.mock) return; // 后端是 mock 模式，不自动刷新

      const currentItems = itemsRef.current;
      const toRefresh: { itemId: string; location: { locationId: string; lat: string; lon: string } }[] = [];

      for (const item of currentItems) {
        if (!item.location) continue;
        const category = classifyDate(item.date);
        if (category !== 'near' && category !== 'far') continue; // 过去/超远期不刷新

        const isMock = item.weather?.source === 'mock';
        const stale = isWeatherStale(item.weatherUpdatedAt, 3);
        if (isMock || stale || !item.weather) {
          toRefresh.push({
            itemId: item.id,
            location: item.location,
          });
        }
      }

      if (toRefresh.length > 0) {
        show(`正在自动刷新 ${toRefresh.length} 条天气数据...`, 'info');
        fetchWeatherBatch(toRefresh);
      }
    }).catch(() => {
      setMockMode(true);
    });
  }, [activeTripId]);

  const handleSaveItem = (data: Omit<ItineraryItem, 'id'>) => {
    if (editingItem) {
      // 用户在编辑器中保存后，自动清除「日期待补充」标记
      const cleaned = editingItem.datePending ? { ...data, datePending: false } : data;
      updateItem(editingItem.id, cleaned);
      show('行程已更新', 'success');
      if (data.location && data.location.locationId !== editingItem.location?.locationId) {
        fetchWeatherBatch([{ itemId: editingItem.id, location: data.location }]);
      }
    } else {
      const newId = addItem(data);
      show('行程已添加', 'success');
      if (data.location) {
        fetchWeatherBatch([{ itemId: newId, location: data.location }]);
      }
    }
    setFormOpen(false);
    setEditingItem(null);
  };

  const handleRefreshWeather = (item: ItineraryItem) => {
    if (!item.location) {
      show('请先选择地点', 'error');
      return;
    }
    fetchWeatherBatch([{ itemId: item.id, location: item.location }]);
  };

  // 全部刷新
  const handleRefreshAll = async () => {
    const targets = items
      .filter((item) => {
        if (!item.location) return false;
        const category = classifyDate(item.date);
        return category === 'near' || category === 'far';
      })
      .map((item) => ({ itemId: item.id, location: item.location! }));

    if (targets.length === 0) {
      show('没有可刷新的行程（需要有地点且日期在未来 15 天内）', 'info');
      return;
    }

    setRefreshingAll(true);
    setMenuOpen(false);
    show(`正在刷新 ${targets.length} 条天气...`, 'info');
    await fetchWeatherBatch(targets);
    setRefreshingAll(false);
    show('全部刷新完成', 'success');
  };

  const handleEdit = (item: ItineraryItem) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteItem(id);
    show('行程已删除', 'success');
  };

  const handleClearDatePending = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    updateItem(id, { ...item, datePending: false });
  };

  const handleCopySummary = async () => {
    const summaryItems = items.map((item) => {
      const daily = item.weather?.daily.find((d) => d.date === item.date);
      const reminders = generateReminders(daily, item.weather?.airQuality, classifyDate(item.date));
      return {
        date: item.date,
        city: item.city,
        district: item.district,
        textDay: daily?.textDay,
        tempMax: daily?.tempMax,
        tempMin: daily?.tempMin,
        precipProbability: daily?.precipProbability,
        reminders,
      };
    });
    const summary = generateWeatherSummary(tripName, summaryItems);
    try {
      await navigator.clipboard.writeText(summary);
      show('已复制行程天气摘要', 'success');
    } catch {
      show('复制失败，请手动复制', 'error');
    }
    setMenuOpen(false);
  };

  const handleSaveName = () => {
    if (nameInput.trim() && activeTripId) {
      renameTrip(activeTripId, nameInput.trim());
    }
    setEditingName(false);
  };

  const hasItems = items.length > 0;

  // 计算最近更新时间（取所有行程中最新的 weatherUpdatedAt）
  const latestUpdate = items
    .map((i) => i.weatherUpdatedAt)
    .filter(Boolean)
    .sort()
    .pop();

  const isAnyRefreshing = refreshingIds.size > 0 || refreshingAll;

  return (
    <div className="flex min-h-screen">
      {/* 旅程侧边栏 */}
      <TripSidebar mobileOpen={sidebarOpen} onCloseMobile={() => setSidebarOpen(false)} />

      {/* 主内容区 */}
      <div className="flex-1 min-w-0 pb-20 md:pb-6">
        {/* 顶部标题栏 */}
        <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-sm border-b border-paper-200">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {/* 移动端侧边栏开关 */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden btn-ghost p-1.5 -ml-1"
                title="旅程列表"
              >
                <Menu size={20} className="text-dawn-500" />
              </button>

              <div className="w-8 h-8 rounded-paper bg-dawn-50 flex items-center justify-center shrink-0">
                <Wind size={18} className="text-dawn-500" />
              </div>
              <div className="min-w-0">
                {editingName ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      onBlur={handleSaveName}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                      className="text-base font-semibold text-gray-800 border-b border-dawn-300 outline-none bg-transparent w-32"
                      autoFocus
                    />
                  </div>
                ) : (
                  <h1
                    className="text-base font-semibold text-gray-800 cursor-pointer hover:text-dawn-600 truncate"
                    onClick={() => { setEditingName(true); setNameInput(tripName); }}
                    title="点击修改旅程名称"
                  >
                    {tripName}
                  </h1>
                )}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-gray-400">一程风信</span>
                  {isMockMode && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-warm-500/10 text-warm-600 rounded-full font-medium">
                      演示模式
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 桌面端工具栏 */}
            <div className="hidden md:flex items-center gap-1">
              <button onClick={handleAddNew} className="btn-primary text-sm py-1.5 px-3">
                <Plus size={15} /> 添加行程
              </button>
              <button onClick={handleRefreshAll} className="btn-ghost text-sm py-1.5 px-2" title="全部刷新">
                <RefreshCw size={16} className={isAnyRefreshing ? 'animate-spin' : ''} />
              </button>
              <button onClick={handleCopySummary} className="btn-ghost text-sm py-1.5 px-2" title="复制摘要" disabled={!hasItems}>
                <Copy size={16} />
              </button>
              <button onClick={() => setExportOpen(true)} className="btn-ghost text-sm py-1.5 px-2" title="导出图片" disabled={!hasItems}>
                <Download size={16} />
              </button>
            </div>

            {/* 移动端更多菜单 */}
            <div className="md:hidden">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="btn-ghost p-1.5"
              >
                {menuOpen ? <X size={20} /> : <MoreVertical size={20} />}
              </button>
            </div>
          </div>

          {/* 移动端下拉菜单 */}
          {menuOpen && (
            <div className="md:hidden border-t border-paper-100 bg-white animate-fade-in">
              <div className="max-w-2xl mx-auto px-4 py-2 space-y-1">
                <button
                  onClick={handleRefreshAll}
                  disabled={!hasItems || isAnyRefreshing}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-paper-50 rounded-paper disabled:opacity-40"
                >
                  <RefreshCw size={16} className={`text-dawn-500 ${isAnyRefreshing ? 'animate-spin' : ''}`} /> 全部刷新天气
                </button>
                <button
                  onClick={handleCopySummary}
                  disabled={!hasItems}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-paper-50 rounded-paper disabled:opacity-40"
                >
                  <Copy size={16} className="text-dawn-500" /> 复制天气摘要
                </button>
                <button
                  onClick={() => { setExportOpen(true); setMenuOpen(false); }}
                  disabled={!hasItems}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-paper-50 rounded-paper disabled:opacity-40"
                >
                  <Download size={16} className="text-dawn-500" /> 导出行程天气笺
                </button>
              </div>
            </div>
          )}
        </header>

        {/* 主内容区 */}
        <main className="max-w-2xl mx-auto px-4 py-4">
          <Timeline
            items={items}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRefreshWeather={handleRefreshWeather}
            refreshingIds={refreshingIds}
            onClearDatePending={handleClearDatePending}
          />
        </main>

        {/* 底部数据来源备注 */}
        {hasItems && (
          <footer className="max-w-2xl mx-auto px-4 pb-4 text-center">
            <p className="text-[11px] text-gray-400">
              天气数据来源：{isMockMode ? '演示数据' : '和风天气（中国气象局）'}
              {latestUpdate && (
                <span className="ml-1">
                  · 最后更新：{new Date(latestUpdate).toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </p>
          </footer>
        )}

        {/* 移动端底部 FAB */}
        <div className="md:hidden fixed bottom-6 right-4 z-30">
          <button
            onClick={handleAddNew}
            className="w-14 h-14 rounded-full bg-dawn-500 text-white shadow-paper-hover flex items-center justify-center active:scale-90 transition-transform"
          >
            <Plus size={26} />
          </button>
        </div>

        {/* 弹窗 */}
        <ItineraryForm
          open={formOpen}
          initial={editingItem}
          onClose={() => { setFormOpen(false); setEditingItem(null); }}
          onSave={handleSaveItem}
        />
        <ExportDialog
          open={exportOpen}
          onClose={() => setExportOpen(false)}
          tripName={tripName}
          items={items}
        />

        {/* Toast 通知 */}
        <ToastContainer />
      </div>
    </div>
  );
}
