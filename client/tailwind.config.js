/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 色板 - 纸质行程笺 + 清晨天空
        dawn: {
          50: '#f0f6ff',   // 最浅晨蓝
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',  // 晨蓝主色
          600: '#2563eb',
          700: '#1d4ed8',
        },
        paper: {
          50: '#fdfbf7',   // 米白纸
          100: '#faf7f0',
          200: '#f5efe3',
          300: '#ede4d0',
        },
        pine: {
          400: '#4ade80',
          500: '#22c55e',  // 松绿点缀
          600: '#16a34a',
        },
        warm: {
          400: '#fb923c',
          500: '#f97316',  // 暖橙提醒
          600: '#ea580c',
        },
        rain: {
          400: '#60a5fa',
          500: '#3b82f6',  // 雨蓝
          600: '#2563eb',
        },
        cold: {
          400: '#818cf8',
          500: '#6366f1',  // 低温蓝
          600: '#4f46e5',
        },
        storm: {
          400: '#f87171',
          500: '#ef4444',  // 暴雨红
          600: '#dc2626',
        },
        aqi: {
          400: '#a78bfa',
          500: '#8b5cf6',  // 空气质量灰紫
          600: '#7c3aed',
        },
      },
      borderRadius: {
        'paper': '8px',
      },
      boxShadow: {
        'paper': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'paper-hover': '0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Microsoft YaHei"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'scale-in': 'scaleIn 0.15s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
