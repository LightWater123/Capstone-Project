import sys
import json
import pdfplumber
import re

# remove whitespaces from strings
def clean(cell):
    return cell.strip() if isinstance(cell, str) else ""

# pdf parse logic
def parse_pdf(path, mode):
    rows = []
    with pdfplumber.open(path) as pdf:
        for page_num, page in enumerate(pdf.pages):  # can be edited to what page u want to parse [:no.]
            #print(f"\nProcessing page {page_num + 1}...")

            # extraction strategies for table detection
            strategies = [
                {"vertical_strategy": "lines", "horizontal_strategy": "lines"}, # visible borders
                {"vertical_strategy": "lines_strict", "horizontal_strategy": "lines_strict"}, #clear formatted borders
                {"vertical_strategy": "text", "horizontal_strategy": "text"}, # uses text positioning to guess table structure
                {"vertical_strategy": "explicit", "horizontal_strategy": "explicit"} # for manual positioning
            ]

            for strategy_idx, strategy in enumerate(strategies):
                #print(f"Trying strategy {strategy_idx + 1}: {strategy}")

                try:
                    tables = page.extract_tables(table_settings=strategy)

                    if tables:
                        #print(f"Found {len(tables)} table(s) with strategy {strategy_idx + 1}")

                        for table in tables:
                            #print(f"Table has {len(table)} rows, {len(table[0]) if table else 0} columns")

                            # preview first few rows for debugging
                            #for i, row in enumerate(table[:3]):
                                #print(f"Row {i}: {row}")

                            # process each row in the table
                            for row in table:
                                if not row or len(row) < 5:
                                    continue

                                # skip header rows
                                if any(keyword in str(row[0]).upper() for keyword in ["ARTICLE", "DESCRIPTION", "PROPERTY", "CERTIFIED"]):
                                    continue

                                # construct the columns
                                data = {
                                    "article": clean(row[0]),
                                    "description": clean(row[1]),
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

                                # check if ppe or rpcsp
                                if mode == "PPE":
                                    data["property_number_RO"] = clean(row[2])
                                    data["property_number_CO"] = clean(row[3]) if len(row) > 3 else ""
                                elif mode == "RPCSP":
                                    data["semi_expendable_property_no"] = clean(row[2])

                                # try to extract remarks
                                if not data["remarks_whereabouts"] and data["article"] and data["description"]:
                                    page_text = page.extract_text()
                                    article_desc = f"{data['article']} {data['description']}".lower()
                                    lines = page_text.split('\n')

                                    for i, line in enumerate(lines):
                                        if article_desc in line.lower():
                                            for j in range(max(0, i-2), min(len(lines), i+3)):
                                                if any(keyword in lines[j].lower() for keyword in [
                                                    "room", "office", "building", "stored", "used",
                                                    "transferred", "car port", "garage", "outside"
                                                ]):
                                                    # regex to extract location
                                                    remarks_match = re.search(
                                                        r'((?:conference|car port|garage|outside|within|stored|used|transferred)[^0-9]*)',
                                                        lines[j],
                                                        re.IGNORECASE
                                                    )
                                                    if remarks_match:
                                                        data["remarks_whereabouts"] = remarks_match.group(1).strip()
                                                        break
                                            break

                                # add a row if it has content
                                if data["article"] or data["description"]:
                                    rows.append(data)

                        break  # stop trying other methods if successful

                except Exception as e:
                    #print(f"Strategy {strategy_idx + 1} failed: {e}")
                    continue

    return rows

# Entry point
if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(1)

    file_path = sys.argv[1]
    mode = sys.argv[2].strip().upper() # ppe or rpcsp
    parsed_data = parse_pdf(file_path, mode)

    # Output JSON to stdout
    json_output = json.dumps(parsed_data)
    sys.stdout.write(json_output)
    sys.stdout.flush()
