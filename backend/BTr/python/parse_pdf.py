import sys
import json
import pdfplumber
import re

def clean(cell):
    return cell.strip() if isinstance(cell, str) else ""

def is_money(value):
    value = str(value).replace(',', '').replace('₱', '').replace('$', '').strip()
    return re.fullmatch(r'\d+(\.\d{1,2})?', value) is not None

def is_small_int(value):
    value = str(value).replace(',', '').strip()
    return value.isdigit() and int(value) <= 1000

def parse_pdf(path, mode):
    rows = []
    expected_columns = 10  # adjust if needed

    with pdfplumber.open(path) as pdf:
        for page in pdf.pages:
            strategies = [
                {"vertical_strategy": "lines", "horizontal_strategy": "lines"},
                {"vertical_strategy": "lines_strict", "horizontal_strategy": "lines_strict"},
                {"vertical_strategy": "text", "horizontal_strategy": "text"},
                {"vertical_strategy": "explicit", "horizontal_strategy": "explicit"}
            ]

            for strategy in strategies:
                try:
                    tables = page.extract_tables(table_settings=strategy)
                    if not tables:
                        continue

                    for table in tables:
                        if len(table) < 2:
                            continue

                        for row in table[1:]:
                            if not row or len(row) < 2:
                                continue

                            # Skip header-like or subtotal rows
                            first_cell = clean(row[0]).lower()
                            if first_cell in ["quantity", "value", "total", "grand total"]:
                                continue
                            if all(is_money(clean(c)) or is_small_int(clean(c)) for c in row if c) and not clean(row[0]).isalpha():
                                continue
                            if len([c for c in row if clean(c)]) < 3:
                                continue

                            cells = [clean(c) for c in row if c is not None]

                            # RPCSP post-processing
                            if mode == "RPCSP":
                                if len(cells) == expected_columns - 1:
                                    merged = cells[4]
                                    parts = re.findall(r'\d+(?:\.\d+)?', merged)
                                    if len(parts) == 2:
                                        unit_value = parts[0]
                                        quantity_card = parts[1]
                                        cells.insert(4, unit_value)
                                        cells.insert(5, quantity_card)

                                while len(cells) < expected_columns:
                                    cells.append("")

                                data = {
                                    "article": cells[0],
                                    "description": cells[1],
                                    "semi_expendable_property_no": cells[2],
                                    "unit_of_measure": cells[3],
                                    "unit_value": cells[4],
                                    "quantity_per_property_card": cells[5],
                                    "quantity_per_physical_count": cells[6],
                                    "shortage_overage": {
                                        "quantity": cells[7],
                                        "value": cells[8]
                                    },
                                    "remarks_whereabouts": cells[9]
                                }

                            elif mode == "PPE":
                                article = clean(row[0])
                                description = clean(row[1])
                                data = {
                                    "article": article,
                                    "description": description,
                                    "property_number_RO": clean(row[2]) if len(row) > 2 else "",
                                    "property_number_CO": clean(row[3]) if len(row) > 3 else "",
                                    "unit_of_measure": clean(row[4]) if len(row) > 4 else "",
                                    "unit_value": clean(row[5]) if len(row) > 5 else "",
                                    "quantity_per_property_card": clean(row[6]) if len(row) > 6 else "",
                                    "quantity_per_physical_count": clean(row[7]) if len(row) > 7 else "",
                                    "shortage_overage": {
                                        "quantity": clean(row[8]) if len(row) > 8 else "",
                                        "value": clean(row[9]) if len(row) > 9 else ""
                                    },
                                    "remarks_whereabouts": clean(row[-1]) if len(row) > 10 else ""
                                }

                            if data["article"] or data["description"]:
                                rows.append(data)

                    break  # stop trying other strategies

                except Exception:
                    continue

    return rows

if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(1)

    file_path = sys.argv[1]
    mode = sys.argv[2].strip().upper()
    parsed_data = parse_pdf(file_path, mode)

    json_output = json.dumps(parsed_data)
    sys.stdout.write(json_output)
    sys.stdout.flush()
