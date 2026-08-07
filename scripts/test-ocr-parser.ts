// Quick smoke test for the enhanced OCR parser
// Usage: cd client && npx tsx ../scripts/test-ocr-parser.ts

import { parseOcrText } from '../client/src/utils/ocr-parser';

function logCase(name: string, text: string) {
  console.log(`\n========== ${name} ==========`);
  console.log('Input text:');
  console.log(text);
  console.log('---');
  const result = parseOcrText(text);
  console.log(`candidates: ${result.candidates.length}`);
  for (const c of result.candidates) {
    console.log(`  ${c.date} | ${c.city}${c.district ? '·' + c.district : ''} | ${c.timeSlot} | datePending=${c.datePending} | note=${c.note ?? '-'}`);
  }
  if (result.detectedDurationDays) console.log(`detectedDuration: ${result.detectedDurationDays} days`);
  if (result.warnings.length) console.log(`warnings: ${result.warnings.join(' | ')}`);
  if (result.unmatchedCityNames.length) console.log(`unmatched: ${result.unmatchedCityNames.join(', ')}`);
}

// Case 1: Day-based itinerary (no real dates)
logCase('旅行社典型 Day 行程（无日期）', `【云南5天4晚纯玩精品团】
第一天: 抵达昆明长水机场，大巴前往酒店休息。
第二天: 上午游览石林景区，下午前往大理。
第三天: 大理古城自由活动，晚上火车前往丽江。
D4: 玉龙雪山一日游，含午餐。
第五天: 丽江古城闲逛，下午飞机返回昆明。
`);

// Case 2: Date-based itinerary
logCase('带具体日期的行程', `2026年8月15日 上午抵达北京首都机场，下午游览故宫。
08月16日 全天 北京-承德 大巴。
2026/8/17 上午：游览避暑山庄。下午：返京。
8月18日 北京-上海 高铁。
`);

// Case 3: Mixed (some dates, some days)
logCase('混合日期+天数', `8月15日 Day1 北京 抵达
第二天 上海 高铁
Day3 上午 杭州西湖
`);

// Case 4: Edge cases
logCase('空文本', ``);

logCase('仅标题', `2026暑期云南全景纯玩五日游`);

logCase('OCR 噪声多', `云南旅游行程安排
出发日期 2026-08-15
D1 \u00a08月15日 携程自营 抵达昆明，免费接机服务
D2 上午 游览石林（车程约1.5小时），品尝过桥米线
D3 大理洱海双廊古镇深度游，包含骑行
D4 \u00a0玉龙雪山印象丽江大型实景演出
D5 返程送机，期待您的下次光临！`);

// Case 5: 长行程但无 days
logCase('社科院风格 PDF 摘要', `9月10日 上午抵达大理，机场接机后入住海景酒店
9月11日 大理古城 + 苍山索道
9月12日 大巴前往泸沽湖（车程4小时）
9月13日 泸沽湖环湖游
9月14日 返回丽江古城
9月15日 玉龙雪山一日游
9月16日 飞机返程
`);

console.log('\n========== ALL DONE ==========');
