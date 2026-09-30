#!/usr/bin/env python3
"""Build a small, dated, static market-pulse snapshot from the WFP/HDX CSV."""
import argparse
import csv
import json
from collections import defaultdict
from pathlib import Path

MARKET_LABELS = {
    "Dhaka Sadar": "Dhaka Sadar",
    "Kawran Bazar Dhaka": "Kawran Bazar, Dhaka",
}
COMMODITIES = {
    "Lentils (masur)": {"en": "Masoor lentils", "bn": "মসুর ডাল"},
    "Wheat flour": {"en": "Wheat flour", "bn": "আটা"},
    "Chili (green)": {"en": "Green chilli", "bn": "কাঁচা মরিচ"},
    "Oil (soybean, fortified)": {"en": "Soybean oil (fortified)", "bn": "সয়াবিন তেল (ফর্টিফায়েড)"},
}


def build(input_path: Path, max_points: int = 10):
    grouped = defaultdict(list)
    with input_path.open(encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream)
        required = {"date", "market", "commodity", "unit", "pricetype", "currency", "price", "priceflag"}
        if not reader.fieldnames or not required.issubset(reader.fieldnames):
            raise ValueError("Input is not the expected WFP/HDX Bangladesh food-price CSV.")
        for row in reader:
            if row["market"] not in MARKET_LABELS or row["commodity"] not in COMMODITIES:
                continue
            if row["pricetype"].lower() != "retail" or row["currency"] != "BDT":
                continue
            if row["priceflag"].lower() not in {"actual", "aggregate"}:
                continue
            try:
                price = float(row["price"])
            except (TypeError, ValueError):
                continue
            if price < 0:
                continue
            grouped[(row["market"], row["commodity"], row["unit"])].append({
                "date": row["date"],
                "price": price,
                "priceflag": row["priceflag"],
            })

    markets = []
    for market, market_label in MARKET_LABELS.items():
        series = []
        for commodity, labels in COMMODITIES.items():
            candidates = [(unit, points) for (m, c, unit), points in grouped.items() if m == market and c == commodity]
            if not candidates:
                continue
            # Keep units separate; if source units changed, choose the unit with the newest record.
            unit, points = max(candidates, key=lambda item: max(p["date"] for p in item[1]))
            # One published record per date; sort and keep the newest N observations.
            by_date = {point["date"]: point for point in points}
            observations = sorted(by_date.values(), key=lambda point: point["date"])[-max_points:]
            series.append({
                "id": commodity,
                "en": labels["en"],
                "bn": labels["bn"],
                "unit": unit,
                "points": observations,
            })
        markets.append({"id": market, "name": market_label, "series": series})

    if not any(market["series"] for market in markets):
        raise ValueError("No supported retail records found for the selected Dhaka markets and foods.")
    dates = [point["date"] for market in markets for item in market["series"] for point in item["points"]]
    return {
        "source": {
            "name": "World Food Programme Price Database via Humanitarian Data Exchange",
            "url": "https://data.humdata.org/dataset/wfp-food-prices-for-bangladesh",
            "license": "CC BY-IGO",
            "licenseUrl": "https://docs.humdata.org/about/data-licenses",
            "snapshotLatestDate": max(dates),
            "snapshotBuiltFrom": input_path.name,
            "purpose": "historical demo only; not a live quote or verified current market price",
        },
        "markets": markets,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", required=True, type=Path, help="Downloaded WFP/HDX Bangladesh CSV")
    parser.add_argument("--output", default=Path("market-data.js"), type=Path)
    parser.add_argument("--max-points", default=10, type=int)
    args = parser.parse_args()
    data = build(args.input, max(2, min(args.max_points, 24)))
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    args.output.write_text("/* Dated public-source excerpt for the historical demo only. */\nwindow.AHAR_MARKET_DEMO = " + payload + ";\n", encoding="utf-8")
    print(json.dumps({"output": str(args.output), "markets": len(data["markets"]), "series": sum(len(m["series"]) for m in data["markets"]), "latestDate": data["source"]["snapshotLatestDate"]}))


if __name__ == "__main__":
    main()
