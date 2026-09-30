#!/usr/bin/env python3
"""Check a WFP/HDX Bangladesh food-price CSV while preserving source units."""
import argparse
import csv
import json
import math
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / 'data' / 'sources.json'
REQUIRED = {
    'date', 'admin1', 'admin2', 'market', 'market_id', 'category', 'commodity',
    'commodity_id', 'unit', 'priceflag', 'pricetype', 'currency', 'price'
}


def validate(file_path, source_id, as_of=None, max_age_days=45, registry_path=REGISTRY):
    registry = json.loads(Path(registry_path).read_text(encoding='utf-8'))
    source = next((item for item in registry.get('sources', []) if item.get('id') == source_id), None)
    errors, warnings = [], []
    if source is None:
        return {'status': 'rejected', 'errors': [f'Unknown source ID: {source_id}'], 'warnings': []}
    if source.get('license', {}).get('reuseStatus') != 'permitted-with-attribution':
        return {'status': 'rejected', 'errors': ['Source reuse is not marked as permitted with attribution in data/sources.json.'], 'warnings': []}

    reference_date = date.fromisoformat(as_of) if as_of else date.today()
    record_count = 0
    bad_rows = 0
    date_values = []
    units = set()
    currencies = set()
    zero_count = 0
    pre_1990_count = 0
    future_count = 0
    row_problems = {}
    try:
        stream = Path(file_path).open(encoding='utf-8-sig', newline='')
    except OSError as exc:
        return {'status': 'rejected', 'errors': [f'Cannot read input CSV: {exc}'], 'warnings': []}

    with stream:
        reader = csv.DictReader(stream)
        if not reader.fieldnames or not REQUIRED.issubset(reader.fieldnames):
            missing = sorted(REQUIRED - set(reader.fieldnames or []))
            return {'status': 'rejected', 'errors': [f'Missing required columns: {", ".join(missing)}'], 'warnings': []}
        for row in reader:
            record_count += 1
            row_errors = []
            if any(not (row.get(column) or '').strip() for column in REQUIRED):
                row_errors.append('missing_required_value')
            raw_date = (row.get('date') or '').strip()
            try:
                observed = date.fromisoformat(raw_date)
                date_values.append(observed)
                if observed.year < 1990:
                    pre_1990_count += 1
                if observed > reference_date:
                    future_count += 1
            except ValueError:
                row_errors.append('invalid_date')
            raw_price = (row.get('price') or '').strip()
            try:
                price = float(raw_price)
                if not math.isfinite(price) or price < 0:
                    row_errors.append('invalid_price')
                elif price == 0:
                    zero_count += 1
            except ValueError:
                row_errors.append('invalid_price')
            currency = (row.get('currency') or '').strip().upper()
            if currency:
                currencies.add(currency)
                if currency != 'BDT':
                    row_errors.append('unsupported_currency')
            unit = (row.get('unit') or '').strip()
            if unit:
                units.add(unit)
            price_type = (row.get('pricetype') or '').strip().lower()
            if price_type and price_type not in {'retail', 'wholesale'}:
                row_errors.append('unknown_price_type')
            if row_errors:
                bad_rows += 1
                for problem in set(row_errors):
                    row_problems[problem] = row_problems.get(problem, 0) + 1

    if record_count == 0:
        errors.append('CSV contains no data rows.')
    if bad_rows:
        errors.append(f'{bad_rows} row(s) failed required-field, date, price, currency, or price-type checks.')
    if pre_1990_count:
        warnings.append(f'{pre_1990_count} row(s) are dated before 1990; inspect for sentinel or historical-date issues.')
    if zero_count:
        warnings.append(f'{zero_count} row(s) have zero price; review against the source before interpretation.')
    if future_count:
        warnings.append(f'{future_count} row(s) are after the selected as-of date.')
    latest = max(date_values).isoformat() if date_values else None
    age_days = (reference_date - max(date_values)).days if date_values else None
    if age_days is not None and age_days > max_age_days:
        warnings.append(f'Latest observation is {age_days} days old (review threshold: {max_age_days}); do not label the snapshot as a current quote.')
    if len(currencies) > 1:
        warnings.append('More than one currency appears; currency normalization is not performed.')

    return {
        'status': 'accepted-with-warnings' if warnings and not errors else ('valid-structure' if not errors else 'rejected'),
        'sourceId': source_id,
        'sourceTitle': source.get('title'),
        'recordCount': record_count,
        'asOf': reference_date.isoformat(),
        'firstDate': min(date_values).isoformat() if date_values else None,
        'latestDate': latest,
        'latestAgeDays': age_days,
        'rawUnits': sorted(units),
        'currencies': sorted(currencies),
        'zeroPriceRows': zero_count,
        'pre1990Rows': pre_1990_count,
        'rowProblemCounts': row_problems,
        'errors': errors,
        'warnings': warnings,
        'normalizationApplied': False,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', required=True, help='source ID from data/sources.json')
    parser.add_argument('--file', required=True, help='path to source CSV')
    parser.add_argument('--as-of', help='reference date YYYY-MM-DD (default: today)')
    parser.add_argument('--max-age-days', type=int, default=45, help='staleness warning threshold (default: 45)')
    args = parser.parse_args()
    try:
        report = validate(args.file, args.source, args.as_of, max(0, args.max_age_days))
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        report = {'status': 'rejected', 'errors': [str(exc)], 'warnings': []}
    print(json.dumps(report, ensure_ascii=False, indent=2))
    raise SystemExit(0 if report['status'] != 'rejected' else 2)


if __name__ == '__main__':
    main()
