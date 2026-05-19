function parseLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ""));
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ""));
  return result;
}

/** Simple CSV parser for lead imports (comma or semicolon, quoted fields). */
export function parseCsv(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const delimiter = lines[0].includes(";") && !lines[0].includes(",") ? ";" : ",";
  const headers = parseLine(lines[0], delimiter);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseLine(lines[i], delimiter);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });
    if (Object.values(row).some((v) => v)) rows.push(row);
  }
  return rows;
}
