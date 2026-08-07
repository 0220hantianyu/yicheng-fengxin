import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ItineraryItem, WeatherData, GeoLocation, Trip } from '../../../shared/types';
import { sortItineraryItems } from '../utils/time-slot';

interface TripState {
  /** 所有旅程 */
  trips: Trip[];
  /** 当前选中的旅程 ID */
  activeTripId: string | null;
  isMockMode: boolean;

  // 旅程管理
  createTrip: (name?: string) => string;
  deleteTrip: (id: string) => void;
  switchTrip: (id: string) => void;
  renameTrip: (id: string, name: string) => void;

  // 行程项操作（作用于活跃旅程）
  setMockMode: (mock: boolean) => void;
  addItem: (item: Omit<ItineraryItem, 'id'>) => string;
  updateItem: (id: string, updates: Partial<ItineraryItem>) => void;
  deleteItem: (id: string) => void;
  addItems: (items: Omit<ItineraryItem, 'id'>[]) => void;
  updateWeather: (id: string, weather: WeatherData) => void;
  updateLocation: (id: string, location: GeoLocation) => void;
}

/** 生成唯一 ID */
function genId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** 更新活跃旅程的 items */
function mapActiveTripItems(
  trips: Trip[],
  activeTripId: string | null,
  updater: (items: ItineraryItem[]) => ItineraryItem[]
): Trip[] {
  return trips.map((t) =>
    t.id === activeTripId
      ? { ...t, items: updater(t.items), updatedAt: new Date().toISOString() }
      : t
  );
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      trips: [],
      activeTripId: null,
      isMockMode: true,

      // ── 旅程管理 ──

      createTrip: (name) => {
        const id = genId('trip');
        const now = new Date().toISOString();
        const trip: Trip = {
          id,
          name: name || `旅程 ${get().trips.length + 1}`,
          items: [],
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          trips: [...state.trips, trip],
          activeTripId: id,
        }));
        return id;
      },

      deleteTrip: (id) => {
        set((state) => {
          const remaining = state.trips.filter((t) => t.id !== id);
          // 如果删除的是当前活跃旅程，切换到第一个
          let newActiveId = state.activeTripId;
          if (state.activeTripId === id) {
            newActiveId = remaining.length > 0 ? remaining[0].id : null;
          }
          // 如果没有旅程了，自动创建一个空的
          if (remaining.length === 0) {
            const now = new Date().toISOString();
            const newTrip: Trip = {
              id: genId('trip'),
              name: '我的旅程',
              items: [],
              createdAt: now,
              updatedAt: now,
            };
            return { trips: [newTrip], activeTripId: newTrip.id };
          }
          return { trips: remaining, activeTripId: newActiveId };
        });
      },

      switchTrip: (id) => {
        set({ activeTripId: id });
      },

      renameTrip: (id, name) => {
        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === id ? { ...t, name, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },

      // ── 行程项操作 ──

      setMockMode: (mock) => set({ isMockMode: mock }),

      addItem: (item) => {
        const id = genId('item');
        const newItem: ItineraryItem = { ...item, id };
        set((state) => ({
          trips: mapActiveTripItems(state.trips, state.activeTripId, (items) =>
            sortItineraryItems([...items, newItem])
          ),
        }));
        return id;
      },

      updateItem: (id, updates) => {
        set((state) => ({
          trips: mapActiveTripItems(state.trips, state.activeTripId, (items) =>
            sortItineraryItems(
              items.map((item) => (item.id === id ? { ...item, ...updates } : item))
            )
          ),
        }));
      },

      deleteItem: (id) => {
        set((state) => ({
          trips: mapActiveTripItems(state.trips, state.activeTripId, (items) =>
            items.filter((item) => item.id !== id)
          ),
        }));
      },

      addItems: (newItems) => {
        const itemsWithIds = newItems.map((item) => ({ ...item, id: genId('item') }));
        set((state) => ({
          trips: mapActiveTripItems(state.trips, state.activeTripId, (items) =>
            sortItineraryItems([...items, ...itemsWithIds])
          ),
        }));
      },

      updateWeather: (id, weather) => {
        set((state) => ({
          trips: mapActiveTripItems(state.trips, state.activeTripId, (items) =>
            items.map((item) =>
              item.id === id
                ? { ...item, weather, weatherUpdatedAt: new Date().toISOString() }
                : item
            )
          ),
        }));
      },

      updateLocation: (id, location) => {
        set((state) => ({
          trips: mapActiveTripItems(state.trips, state.activeTripId, (items) =>
            items.map((item) => (item.id === id ? { ...item, location } : item))
          ),
        }));
      },
    }),
    {
      name: 'yi-cheng-feng-xin-storage',
      version: 1,
      // 从 v0（单旅程）迁移到 v1（多旅程）
      migrate: (persistedState: any, version: number) => {
        if (version === 0 && persistedState) {
          const tripId = genId('trip');
          const now = new Date().toISOString();
          return {
            ...persistedState,
            trips: [
              {
                id: tripId,
                name: persistedState.tripName || '我的旅程',
                items: persistedState.items || [],
                createdAt: now,
                updatedAt: now,
              },
            ],
            activeTripId: tripId,
          };
        }
        return persistedState;
      },
    }
  )
);
