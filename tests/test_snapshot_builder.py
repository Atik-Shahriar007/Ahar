import importlib.util
import tempfile
import unittest
from pathlib import Path

MODULE_PATH = Path(__file__).resolve().parents[1] / 'scripts' / 'build_demo_market_snapshot.py'
spec = importlib.util.spec_from_file_location('snapshot_builder', MODULE_PATH)
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class SnapshotBuilderTests(unittest.TestCase):
    def test_only_selected_market_retail_bdt_records_are_kept(self):
        with tempfile.TemporaryDirectory() as folder:
            source = Path(folder) / 'prices.csv'
            source.write_text(
                'date,market,commodity,unit,pricetype,currency,price,priceflag\n'
                '2026-05-15,Dhaka Sadar,Lentils (masur),KG,Retail,BDT,90,actual\n'
                '2026-06-15,Dhaka Sadar,Lentils (masur),KG,Wholesale,BDT,80,actual\n'
                '2026-06-15,Dhaka Sadar,Lentils (masur),KG,Retail,USD,1,actual\n'
                '2026-06-15,Other market,Lentils (masur),KG,Retail,BDT,70,actual\n',
                encoding='utf-8',
            )
            data = builder.build(source)
            dhaka = next(market for market in data['markets'] if market['id'] == 'Dhaka Sadar')
            series = next(item for item in dhaka['series'] if item['id'] == 'Lentils (masur)')
            self.assertEqual(series['points'], [{'date': '2026-05-15', 'price': 90.0, 'priceflag': 'actual'}])
            self.assertEqual(data['source']['snapshotLatestDate'], '2026-05-15')

    def test_rejects_wrong_schema(self):
        with tempfile.TemporaryDirectory() as folder:
            source = Path(folder) / 'bad.csv'
            source.write_text('food,price\nrice,50\n', encoding='utf-8')
            with self.assertRaisesRegex(ValueError, 'expected WFP/HDX'):
                builder.build(source)


if __name__ == '__main__':
    unittest.main()
