import { useRef, useState } from 'react';
import { Download, X, Loader2, ImageDown } from 'lucide-react';
import html2canvas from 'html2canvas';
import type { ItineraryItem, WeatherReminder } from '../../../shared/types';
import { formatDateChinese, classifyDate } from '../utils/date';
import { generateReminders } from '../utils/weather-rules';
import { TIME_SLOT_LABELS } from '../utils/time-slot';
import { useToast } from '../stores/toast-store';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  tripName: string;
  items: ItineraryItem[];
}

function getWeatherEmoji(code: string): string {
  const codeNum = parseInt(code, 10);
  if (codeNum === 100) return '☀️';
  if ([101, 102, 103].includes(codeNum)) return '⛅';
  if (codeNum === 104) return '☁️';
  if ([300, 301, 302, 303].includes(codeNum)) return '⛈️';
  if ([304, 305, 306, 307].includes(codeNum)) return '🌧️';
 if ([314, 315, 316, 317, 318, 399].includes(codeNum)) return '🌧️';
  if ([400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 499].includes(codeNum)) return '🌨️';
  if ([500, 501, 502, 503, 504, 507, 508].includes(codeNum)) return '🌫️';
  return '☁️';
}

export function ExportDialog({ open, onClose, tripName, items }: ExportDialogProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const { show } = useToast();

  if (!open) return null;

  // 按日期排序
  const sortedItems = [...items].sort((a, b) => a.date.localeCompare(b.date));
  const dates = sortedItems.length > 0 ? sortedItems : [];
  const dateRange = dates.length > 0
    ? `${dates[0].date} ~ ${dates[dates.length - 1].date}`
    : '';

  // 是否有 8-15 天趋势
  const hasTrend = sortedItems.some((item) => classifyDate(item.date) === 'far');
  // 是否有演示数据
  const hasMock = sortedItems.some((item) => item.weather?.source === 'mock');
  // 最后更新时间
  const updateTimes = sortedItems
    .map((i) => i.weather?.updateTime)
    .filter(Boolean)
    .sort();
  const lastUpdate = updateTimes.length > 0 ? updateTimes[updateTimes.length - 1] : null;

  const handleExport = async () => {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        backgroundColor: '#fdfbf7',
        useCORS: true,
        logging: false,
      });
      const link = document.createElement('a');
      link.download = `${tripName}_行程天气笺.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      show('导出成功', 'success');
      onClose();
    } catch (err) {
      console.error('Export error:', err);
      show('导出失败，请重试', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/30 animate-fade-in" onClick={onClose}>
      <div
        className="bg-white w-full md:w-[480px] md:max-w-[92vw] rounded-t-paper md:rounded-paper shadow-paper-hover p-5 animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <ImageDown size={20} className="text-dawn-500" />
            导出行程天气笺
          </h2>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X size={20} />
          </button>
        </div>

        {/* 预览区域 */}
        <div className="bg-paper-50 rounded-paper p-3 max-h-[50vh] overflow-y-auto">
          <div
            ref={exportRef}
            className="bg-white rounded-paper p-5"
            style={{ width: '400px', maxWidth: '100%' }}
          >
            {/* 标题 */}
            <div className="text-center mb-3 pb-3 border-b-2 border-dawn-100">
              <h1 className="text-xl font-bold text-dawn-600">一程风信</h1>
              <p className="text-sm text-gray-600 mt-1">{tripName}</p>
              {dateRange && (
                <p className="text-xs text-gray-400 mt-0.5">{dateRange}</p>
              )}
            </div>

            {/* 行程天气列表 */}
            <div className="space-y-2.5">
              {sortedItems.map((item) => {
                const daily = item.weather?.daily.find((d) => d.date === item.date);
                const reminders: WeatherReminder[] = generateReminders(
                  daily,
                  item.weather?.airQuality,
                  classifyDate(item.date)
                );
                const category = classifyDate(item.date);

                return (
                  <div key={item.id} className="flex items-start gap-2 pb-2 border-b border-paper-100 last:border-0">
                    {/* 日期 */}
                    <div className="shrink-0 w-16 text-right">
                      <div className="text-xs text-gray-400">
                        {item.date.substring(5).replace('-', '/')}
                      </div>
                      <div className="text-[10px] text-gray-300">
                        {TIME_SLOT_LABELS[item.timeSlot]}
                      </div>
                    </div>

                    {/* 城市 + 天气 */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800">
                        {item.city}{item.district && ` · ${item.district}`}
                      </div>
                      {daily ? (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                          <span>{getWeatherEmoji(daily.codeDay)}</span>
                          <span>{daily.textDay}</span>
                          <span className="font-medium text-gray-700">
                            {daily.tempMax}°/{daily.tempMin}°
                          </span>
                          {daily.precipProbability > 0 && (
                            <span className="text-rain-500">雨{daily.precipProbability}%</span>
                          )}
                        </div>
                      ) : category === 'past' ? (
                        <div className="text-xs text-gray-400 mt-0.5">历史行程</div>
                      ) : category === 'beyond' ? (
                        <div className="text-xs text-gray-400 mt-0.5">暂不可预报</div>
                      ) : (
                        <div className="text-xs text-gray-400 mt-0.5">暂无天气数据</div>
                      )}
                      {/* 提醒 */}
                      {reminders.length > 0 && (
                        <div className="mt-0.5 text-[10px] text-gray-400">
                          {reminders.map((r, i) => (
                            <span key={i}>
                              {i > 0 && '；'}
                              {r.message}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 底部信息 */}
            <div className="mt-3 pt-2 border-t border-paper-100 text-[10px] text-gray-300">
              {lastUpdate && (
                <div>数据更新时间: {new Date(lastUpdate).toLocaleString('zh-CN')}</div>
              )}
              {hasTrend && (
                <div>注: 8-15 天趋势预报存在不确定性，仅供参考</div>
              )}
              {hasMock && (
                <div className="text-warm-400">⚠ 本页包含演示数据，非真实天气</div>
              )}
              <div className="mt-1">由一程风信生成</div>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="btn-secondary flex-1">
            取消
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || sortedItems.length === 0}
            className="btn-primary flex-1 flex items-center justify-center gap-1.5"
          >
            {exporting ? (
              <><Loader2 size={16} className="animate-spin" /> 导出中...</>
            ) : (
              <><Download size={16} /> 导出图片</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
