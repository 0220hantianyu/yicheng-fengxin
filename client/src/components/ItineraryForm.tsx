import { useState, useEffect } from 'react';
import { X, Calendar, FileText, Check } from 'lucide-react';
import type { ItineraryItem, TimeSlot, GeoLocation } from '../../../shared/types';
import { CitySearch } from './CitySearch';
import { TIME_SLOT_LABELS } from '../utils/time-slot';

interface ItineraryFormProps {
  open: boolean;
  initial?: ItineraryItem | null;
  onClose: () => void;
  onSave: (data: Omit<ItineraryItem, 'id'>) => void;
}

const TIME_SLOTS: TimeSlot[] = ['morning', 'afternoon', 'evening', 'allday', 'unknown'];

export function ItineraryForm({ open, initial, onClose, onSave }: ItineraryFormProps) {
  const [date, setDate] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('allday');
  const [note, setNote] = useState('');
  const [location, setLocation] = useState<GeoLocation | undefined>(initial?.location);

  useEffect(() => {
    if (initial) {
      setDate(initial.date);
      setCity(initial.city);
      setDistrict(initial.district || '');
      setTimeSlot(initial.timeSlot);
      setNote(initial.note || '');
      setLocation(initial.location);
    } else {
      setDate('');
      setCity('');
      setDistrict('');
      setTimeSlot('allday');
      setNote('');
      setLocation(undefined);
    }
  }, [initial, open]);

  if (!open) return null;

  const handleSave = () => {
    if (!date || !city) return;
    onSave({
      date,
      city,
      district: district || undefined,
      timeSlot,
      note: note || undefined,
      location,
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/30 animate-fade-in" onClick={onClose}>
      <div
        className="bg-white w-full md:w-[460px] md:max-w-[92vw] rounded-t-paper md:rounded-paper shadow-paper-hover p-5 animate-slide-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {initial ? '编辑行程' : '新增行程'}
          </h2>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {/* 日期 */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-1.5">
              <Calendar size={14} /> 日期 <span className="text-storm-500">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-base"
            />
          </div>

          {/* 城市 + 区县 */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-1.5">
              <FileText size={14} /> 城市 <span className="text-storm-500">*</span>
            </label>
            <CitySearch
              initialCity={city}
              initialDistrict={district}
              onConfirm={(loc) => {
                setLocation(loc);
                setCity(loc.adm2 || loc.adm1);
                setDistrict(loc.displayName.includes('·') ? loc.displayName.split('·').pop() || '' : '');
              }}
            />
            <input
              type="text"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setLocation(undefined);
              }}
              placeholder="城市名称"
              className="input-base mt-2"
            />
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="区县（可选）"
              className="input-base mt-2"
            />
          </div>

          {/* 到达时段 */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1.5 block">到达时段</label>
            <div className="flex flex-wrap gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setTimeSlot(slot)}
                  className={`px-3 py-1.5 rounded-paper text-sm font-medium transition-all ${
                    timeSlot === slot
                      ? 'bg-dawn-500 text-white'
                      : 'bg-paper-100 text-gray-600 hover:bg-paper-200'
                  }`}
                >
                  {TIME_SLOT_LABELS[slot]}
                </button>
              ))}
            </div>
          </div>

          {/* 备注 */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1.5 block">备注（可选）</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="如：参观故宫、登长城等"
              rows={2}
              className="input-base resize-none"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1">
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={!date || !city}
            className="btn-primary flex-1 flex items-center justify-center gap-1.5"
          >
            <Check size={16} /> 保存
          </button>
        </div>
      </div>
    </div>
  );
}
