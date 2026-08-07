"""Convert QWeather China-City-List CSV to JSON for Mock adapter."""
import csv
import json
import os

csv_path = os.path.join(os.path.dirname(__file__), "china-cities-raw.csv")
out_path = os.path.join(os.path.dirname(__file__), "server", "src", "data", "china-cities.json")

os.makedirs(os.path.dirname(out_path), exist_ok=True)

cities = []
seen_ids = set()

with open(csv_path, "r", encoding="utf-8") as f:
    # Skip first line (version)
    next(f)
    reader = csv.DictReader(f)
    for row in reader:
        loc_id = row.get("Location_ID", "").strip()
        if not loc_id or loc_id in seen_ids:
            continue
        seen_ids.add(loc_id)

        name_zh = row.get("Location_Name_ZH", "").strip()
        if not name_zh:
            continue

        cities.append({
            "name": name_zh,
            "id": loc_id,
            "lat": row.get("Latitude", "").strip(),
            "lon": row.get("Longitude", "").strip(),
            "adm1": row.get("Adm1_Name_ZH", "").strip(),
            "adm2": row.get("Adm2_Name_ZH", "").strip(),
            "country": row.get("Country_Region_ZH", "").strip(),
        })

with open(out_path, "w", encoding="utf-8") as f:
    json.dump(cities, f, ensure_ascii=False, indent=2)

print(f"Generated {len(cities)} cities -> {out_path}")
print(f"File size: {os.path.getsize(out_path)} bytes")

# Print sample
print("\n--- Sample (first 5) ---")
for c in cities[:5]:
    print(f"  {c['name']} ({c['adm1']} {c['adm2']}) id={c['id']}")

# Check Xishuangbanna
print("\n--- Xishuangbanna search ---")
for c in cities:
    if "西双版纳" in c["name"] or "西双版纳" in c["adm1"] or "西双版纳" in c["adm2"]:
        print(f"  {c['name']} ({c['adm1']} {c['adm2']}) id={c['id']}")
