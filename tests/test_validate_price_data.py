import csv
import json
import tempfile
import unittest
from datetime import date
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import validate_price_data as validator

HEADER = ['date','admin1','admin2','market','market_id','category','commodity','commodity_id','unit','priceflag','pricetype','currency','price']


def row(day='2026-07-15', unit='KG', price='90', currency='BDT'):
    return [day,'Dhaka','Dhaka','Dhaka Sadar','123','pulses','Lentils (masur)','61',unit,'actual','Retail',currency,price]


class PriceDataValidatorTests(unittest.TestCase):
    def csv_file(self, folder, rows):
        path = Path(folder) / 'sample.csv'
        with path.open('w', encoding='utf-8', newline='') as handle:
            writer = csv.writer(handle)
            writer.writerow(HEADER)
            writer.writerows(rows)
        return path

    def test_historical_and_zero_rows_are_flagged_not_silently_rewritten(self):
        with tempfile.TemporaryDirectory() as folder:
            path = self.csv_file(folder, [row('1900-08-15', '100 KG', '0'), row()])
            result = validator.validate(path, 'wfp-hdx-bangladesh-food-prices', '2026-09-30', 45)
            self.assertEqual(result['status'], 'accepted-with-warnings')
            self.assertEqual(result['recordCount'], 2)
            self.assertEqual(result['zeroPriceRows'], 1)
            self.assertEqual(result['pre1990Rows'], 1)
            self.assertEqual(result['normalizationApplied'], False)
            self.assertIn('100 KG', result['rawUnits'])
            self.assertTrue(any('days old' in warning for warning in result['warnings']))

    def test_bad_currency_and_negative_price_are_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            path = self.csv_file(folder, [row(price='-3'), row(currency='USD')])
            result = validator.validate(path, 'wfp-hdx-bangladesh-food-prices', '2026-09-30')
            self.assertEqual(result['status'], 'rejected')
            self.assertIn('2 row(s)', result['errors'][0])
            self.assertGreaterEqual(result['rowProblemCounts'].get('invalid_price', 0), 1)
            self.assertGreaterEqual(result['rowProblemCounts'].get('unsupported_currency', 0), 1)

    def test_source_without_permitted_attribution_status_is_blocked(self):
        with tempfile.TemporaryDirectory() as folder:
            path = self.csv_file(folder, [row()])
            result = validator.validate(path, 'fctb-2013', '2026-09-30')
            self.assertEqual(result['status'], 'rejected')
            self.assertIn('not marked as permitted', result['errors'][0])

    def test_unknown_source_is_rejected(self):
        with tempfile.TemporaryDirectory() as folder:
            path = self.csv_file(folder, [row()])
            result = validator.validate(path, 'not-a-source', '2026-09-30')
            self.assertEqual(result['status'], 'rejected')
            self.assertIn('Unknown source ID', result['errors'][0])


if __name__ == '__main__':
    unittest.main()
