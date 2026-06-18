import { Button } from '@/components/ui/button'
import { Clock, Rows3, Download } from 'lucide-react'

function ResultSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-2 h-5 rounded bg-slate-100" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="mb-1.5 flex gap-2">
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="h-4 flex-1 rounded bg-slate-100" />
          ))}
        </div>
      ))}
    </div>
  )
}

export function ResultPanel({ showResult, isRunning, resultColumns, resultRows, executionMeta }) {
  return (
    <section className="flex flex-1 flex-col w-full min-h-0 border-t border-slate-200 bg-white z-10">
      <div className="flex h-8 shrink-0 items-center justify-between border-b border-slate-200 px-3">
        <div className="flex items-center gap-1">
          {['查询结果', '运行日志', '执行计划'].map((label) => (
            <button
              key={label}
              className={`rounded px-3 py-1 text-xs font-medium ${
                label === '查询结果' ? 'bg-cyan-50 text-cyan-700' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {!showResult ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-400">
            点击 Run 查看查询结果
          </div>
        ) : isRunning ? (
          <ResultSkeleton />
        ) : (
          <div className="overflow-hidden rounded border border-slate-200">
            <table className="w-full text-[11px]">
              <thead className="bg-slate-50 text-left font-semibold text-slate-600">
                <tr>
                  {resultColumns.map((col) => (
                    <th key={col} className="px-3 py-1.5">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resultRows.map((row, idx) => (
                  <tr key={idx} className="bg-white hover:bg-slate-50">
                    {resultColumns.map((col) => (
                      <td key={`${idx}-${col}`} className="px-3 py-1.5 text-slate-700">{String(row[col] ?? '-')}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* 紧凑状态栏 */}
      <div className="flex h-8 shrink-0 items-center justify-between border-t border-slate-200 bg-slate-50 px-3 text-[11px] text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Query Time: {executionMeta.queryTime}
          </span>
          <span>Execution Time: {executionMeta.executionTime}</span>
          <span className="flex items-center gap-1">
            <Rows3 className="h-3 w-3" />
            Scanned Rows: {executionMeta.scannedRows}
          </span>
        </div>
        <Button variant="ghost" size="sm" className="h-6 gap-1 text-xs text-slate-600">
          <Download className="h-3 w-3" />
          导出 Excel
        </Button>
      </div>
    </section>
  )
}
