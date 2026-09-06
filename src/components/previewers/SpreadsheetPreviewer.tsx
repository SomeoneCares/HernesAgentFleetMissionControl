import React, { useState } from 'react';
import { ArtifactItem } from '../../types';
import { 
  Table, 
  Search, 
  Download, 
  Filter, 
  Calculator, 
  Layers, 
  Plus,
  BarChart2,
  FileSpreadsheet
} from 'lucide-react';

interface SpreadsheetPreviewerProps {
  artifact: ArtifactItem;
}

export const SpreadsheetPreviewer: React.FC<SpreadsheetPreviewerProps> = ({ artifact }) => {
  const spreadsheetData = artifact.spreadsheetData || {
    activeSheet: 'Fleet_VRAM_Allocation',
    sheets: [
      {
        name: 'Fleet_VRAM_Allocation',
        columns: ['A: Fleet ID', 'B: Partition Codename', 'C: Active Workers', 'D: Allocated VRAM', 'E: VRAM Cap', 'F: Load Factor', 'G: Status'],
        rows: [
          ['FLEET-01', 'FLEET-ALPHA-CORE', '14', '68.4 GB', '80.0 GB', '85.5%', 'NOMINAL'],
          ['FLEET-02', 'FLEET-QUANTUM-MATH', '8', '74.2 GB', '80.0 GB', '92.7%', 'HEAVY'],
          ['FLEET-03', 'FLEET-SEC-SENTINEL', '6', '38.0 GB', '80.0 GB', '47.5%', 'OPTIMAL'],
          ['FLEET-04', 'FLEET-CREATIVE-EXP', '4', '29.5 GB', '80.0 GB', '36.8%', 'IDLE'],
          ['TOTAL', 'AGGREGATE HOST CLUSTER', '32', '210.1 GB', '320.0 GB', '65.6%', 'HEALTHY']
        ]
      },
      {
        name: 'Token_Burn_&_Cost',
        columns: ['A: Model SKU', 'B: Ingest Tokens (M)', 'C: Egress Tokens (M)', 'D: Cache Read Rate', 'E: Burn Rate ($/hr)', 'F: Daily Budget', 'G: Cap Status'],
        rows: [
          ['claude-3-7-sonnet', '48.2', '12.4', '78.2%', '$14.20', '$350.00', 'IN_BUDGET'],
          ['deepseek-r1-671b', '86.5', '34.8', '62.4%', '$6.80', '$200.00', 'IN_BUDGET'],
          ['gemini-2.0-flash', '142.0', '48.6', '89.1%', '$3.40', '$150.00', 'IN_BUDGET'],
          ['qwen-2.5-coder-32b', '18.4', '8.9', '94.0%', '$1.20', '$50.00', 'OPTIMAL']
        ]
      },
      {
        name: 'Model_Throughput_Bench',
        columns: ['A: Model Identity', 'B: TTFT (ms)', 'C: Avg Tokens/sec', 'D: Peak Burst (tps)', 'E: GPU VRAM Footprint', 'F: Context Window'],
        rows: [
          ['Claude 3.7 Sonnet', '240 ms', '78 tps', '92 tps', '80 GB SXM5', '200,000 tokens'],
          ['DeepSeek R1', '410 ms', '52 tps', '64 tps', '160 GB H200', '128,000 tokens'],
          ['Gemini 2.0 Flash', '110 ms', '145 tps', '168 tps', 'Hosted API', '1,000,000 tokens'],
          ['Qwen 2.5 Coder', '180 ms', '94 tps', '112 tps', '48 GB RTX 6000', '131,072 tokens']
        ]
      }
    ]
  };

  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number }>({ row: 0, col: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  const currentSheet = spreadsheetData.sheets[activeSheetIndex] || spreadsheetData.sheets[0];

  const filteredRows = currentSheet.rows.filter(row => 
    !searchQuery || row.some(cell => cell.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedCellValue = currentSheet.rows[selectedCell.row]?.[selectedCell.col] || '';
  const colLetter = String.fromCharCode(65 + selectedCell.col);
  const cellCoord = `${colLetter}${selectedCell.row + 1}`;

  return (
    <div className="space-y-3 font-mono text-xs">
      {/* Excel Workbook Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0d1814] border border-emerald-500/20 text-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs">{artifact.name}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold">
                XLSX WORKBOOK
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
              <span>{spreadsheetData.sheets.length} Sheets</span>
              <span>•</span>
              <span>{currentSheet.rows.length} Records</span>
              <span>•</span>
              <span>Grid Engine Ready</span>
            </div>
          </div>
        </div>

        {/* Filter / Search within sheet */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search sheet..."
              className="pl-8 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder:text-slate-500 text-xs focus:outline-none focus:border-emerald-400 w-44"
            />
          </div>
        </div>
      </div>

      {/* Formula & Coordinate Bar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-black/60 rounded-xl border border-white/10 text-xs">
        <div className="flex items-center gap-1 px-2.5 py-1 bg-white/[0.06] border border-white/10 rounded font-bold text-emerald-400 min-w-[54px] text-center">
          {cellCoord}
        </div>
        <span className="text-slate-500 font-serif italic text-sm">fx</span>
        <div className="flex-1 px-3 py-1 bg-white/[0.02] border border-white/[0.06] rounded text-slate-200 overflow-x-auto whitespace-nowrap">
          {selectedCellValue || '=VALUE()'}
        </div>
      </div>

      {/* Spreadsheet Grid Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#070b0e] shadow-xl max-h-[500px]">
        <table className="w-full text-left border-collapse select-none">
          <thead>
            <tr className="bg-white/[0.04] text-slate-400 border-b border-white/10">
              {/* Row Index Corner */}
              <th className="w-10 p-2 text-center text-[10px] bg-white/[0.02] border-r border-white/10 font-mono text-slate-500">
                #
              </th>
              {currentSheet.columns.map((col, ci) => (
                <th 
                  key={ci} 
                  className="p-2.5 text-[11px] font-bold text-emerald-400/90 border-r border-white/10 whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredRows.map((row, ri) => (
              <tr key={ri} className="hover:bg-white/[0.02] transition-colors">
                {/* Row Number Header */}
                <td className="p-2 text-center text-[10px] bg-white/[0.02] border-r border-white/10 text-slate-500 font-mono font-bold">
                  {ri + 1}
                </td>

                {row.map((cell, ci) => {
                  const isSelected = selectedCell.row === ri && selectedCell.col === ci;
                  const isStatus = cell === 'NOMINAL' || cell === 'OPTIMAL' || cell === 'HEALTHY' || cell === 'IN_BUDGET';
                  const isWarning = cell === 'HEAVY' || cell === 'WARNING';

                  return (
                    <td
                      key={ci}
                      onClick={() => setSelectedCell({ row: ri, col: ci })}
                      className={`p-2.5 text-xs text-slate-300 border-r border-white/[0.06] whitespace-nowrap cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-emerald-500/20 ring-1 ring-emerald-400 text-white font-semibold' 
                          : 'hover:bg-white/[0.04]'
                      }`}
                    >
                      {isStatus ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                          {cell}
                        </span>
                      ) : isWarning ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                          {cell}
                        </span>
                      ) : (
                        cell
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Multi-Sheet Tab Bar & Aggregates */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
          {spreadsheetData.sheets.map((sheet, sIndex) => (
            <button
              key={sheet.name}
              onClick={() => {
                setActiveSheetIndex(sIndex);
                setSelectedCell({ row: 0, col: 0 });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSheetIndex === sIndex
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
              type="button"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{sheet.name}</span>
            </button>
          ))}
        </div>

        {/* Quick Aggregates Bar */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono bg-white/[0.02] px-3 py-1.5 rounded-lg border border-white/[0.06]">
          <span>CELLS: <strong className="text-white">{currentSheet.rows.length * currentSheet.columns.length}</strong></span>
          <span>•</span>
          <span>FILTERED: <strong className="text-emerald-400">{filteredRows.length} ROWS</strong></span>
        </div>
      </div>
    </div>
  );
};
