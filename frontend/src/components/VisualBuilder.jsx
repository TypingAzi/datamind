import { useState, useEffect, useRef, useCallback } from 'react'
import { X, GripVertical, Settings2, Filter, ArrowUpDown, LayoutGrid, Table2 } from 'lucide-react'
import { ResultPanel } from '@/components/ResultPanel'

const JOIN_TYPES = ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN']
const FILTER_OPS = ['=', '!=', '>', '>=', '<', '<=', 'LIKE', 'IN']

function generateId() {
  return Math.random().toString(36).slice(2, 9)
}

function findTableByName(schemaTree, name) {
  const sections = schemaTree?.children || []
  for (const section of sections) {
    const table = section.children?.find((t) => t.name === name || t.tableName === name)
    if (table) return { ...table, sectionType: section.sectionType }
  }
  return null
}

function buildSql({ tables, joins, columns, filters, sort, limit }) {
  if (tables.length === 0) return ''

  const selectedFields =
    columns.length > 0
      ? columns.map((c) => `${c.tableName}.${c.field.englishName || c.field.name}`).join(',\n  ')
      : '*'

  let sql = `SELECT\n  ${selectedFields}\nFROM ${tables[0].tableName || tables[0].name}`

  joins.forEach((join) => {
    const toTable = tables.find((t) => t.id === join.toTableId)
    if (!toTable) return
    const onClause =
      join.fromField && join.toField
        ? `${tables[0].tableName || tables[0].name}.${join.fromField} = ${toTable.tableName || toTable.name}.${join.toField}`
        : '1=1'
    sql += `\n${join.joinType} ${toTable.tableName || toTable.name} ON ${onClause}`
  })

  if (filters.length > 0) {
    const whereClauses = filters
      .map((f) => {
        const fieldName = `${f.tableName}.${f.field.englishName || f.field.name}`
        const val = ['IN', 'NOT IN'].includes(f.operator)
          ? `(${f.value.split(',').map((v) => `'${v.trim()}'`).join(', ')})`
          : !isNaN(Number(f.value))
            ? f.value
            : `'${f.value}'`
        return `${fieldName} ${f.operator} ${val}`
      })
      .join('\n  AND ')
    sql += `\nWHERE ${whereClauses}`
  }

  if (sort.tableId && sort.field) {
    const sortTable = tables.find((t) => t.id === sort.tableId)
    if (sortTable) {
      sql += `\nORDER BY ${sortTable.tableName || sortTable.name}.${sort.field.englishName || sort.field.name} ${sort.direction}`
    }
  }

  if (limit) {
    sql += `\nLIMIT ${limit}`
  }

  sql += ';'
  return sql
}

function buildInitialState(initialTable, schemaTree) {
  if (!initialTable) {
    return {
      tables: [],
      joins: [],
      columns: [],
      filters: [],
      sort: { tableId: '', field: null, direction: 'ASC' },
      limit: 100,
    }
  }
  const table = findTableByName(schemaTree, initialTable.name)
  if (!table) {
    return {
      tables: [],
      joins: [],
      columns: [],
      filters: [],
      sort: { tableId: '', field: null, direction: 'ASC' },
      limit: 100,
    }
  }

  const newTable = {
    id: generateId(),
    name: table.name,
    tableName: table.tableName || table.name,
    sectionType: table.sectionType,
    fields: table.children || [],
    x: 40,
    y: 40,
  }

  return {
    tables: [newTable],
    joins: [],
    columns:
      table.children?.map((field) => ({
        id: generateId(),
        tableId: newTable.id,
        tableName: newTable.tableName,
        field,
      })) || [],
    filters: [],
    sort: { tableId: '', field: null, direction: 'ASC' },
    limit: 100,
  }
}

export function VisualBuilder({
  schemaTree,
  initialTable,
  onSqlChange,
  showResult,
  isRunning,
  resultColumns,
  resultRows,
  executionMeta,
}) {
  const canvasRef = useRef(null)
  const [tables, setTables] = useState(() => buildInitialState(initialTable, schemaTree).tables)
  const [joins, setJoins] = useState(() => buildInitialState(initialTable, schemaTree).joins)
  const [columns, setColumns] = useState(() => buildInitialState(initialTable, schemaTree).columns)
  const [filters, setFilters] = useState(() => buildInitialState(initialTable, schemaTree).filters)
  const [sort, setSort] = useState(() => buildInitialState(initialTable, schemaTree).sort)
  const [limit, setLimit] = useState(() => buildInitialState(initialTable, schemaTree).limit)
  const [editingJoin, setEditingJoin] = useState(null)
  const [dragOverZone, setDragOverZone] = useState(null)
  const [canvasHover, setCanvasHover] = useState(false)

  // SQL 联动
  useEffect(() => {
    const sql = buildSql({ tables, joins, columns, filters, sort, limit })
    onSqlChange?.(sql)
  }, [tables, joins, columns, filters, sort, limit, onSqlChange])

  const handleCanvasDrop = useCallback(
    (e) => {
      e.preventDefault()
      setCanvasHover(false)
      try {
        const data = JSON.parse(e.dataTransfer.getData('application/json') || '{}')
        if (data.kind !== 'table') return

        const table = findTableByName(schemaTree, data.name)
        if (!table) return
        if (tables.some((t) => t.name === table.name)) return

        const count = tables.length
        const newTable = {
          id: generateId(),
          name: table.name,
          tableName: table.tableName || table.name,
          sectionType: table.sectionType,
          fields: table.children || [],
          x: 40 + count * 280,
          y: 40,
        }

        setTables((prev) => {
          const next = [...prev, newTable]
          if (prev.length > 0) {
            setJoins((prevJoins) => [
              ...prevJoins,
              {
                id: generateId(),
                fromTableId: prev[0].id,
                toTableId: newTable.id,
                joinType: 'LEFT JOIN',
                fromField: '',
                toField: '',
              },
            ])
          }
          return next
        })
      } catch {
        // ignore invalid drop
      }
    },
    [schemaTree, tables]
  )

  const ensureTableOnCanvas = useCallback(
    (tableName) => {
      const existing = tables.find((t) => t.tableName === tableName || t.name === tableName)
      if (existing) return existing

      const table = findTableByName(schemaTree, tableName)
      if (!table) return null

      const count = tables.length
      const newTable = {
        id: generateId(),
        name: table.name,
        tableName: table.tableName || table.name,
        sectionType: table.sectionType,
        fields: table.children || [],
        x: 40 + count * 280,
        y: 40,
      }

      setTables((prev) => {
        const next = [...prev, newTable]
        if (prev.length > 0) {
          setJoins((prevJoins) => [
            ...prevJoins,
            {
              id: generateId(),
              fromTableId: prev[0].id,
              toTableId: newTable.id,
              joinType: 'LEFT JOIN',
              fromField: '',
              toField: '',
            },
          ])
        }
        return next
      })
      return newTable
    },
    [schemaTree, tables]
  )

  const handleDropzoneDrop = useCallback(
    (zone) => (e) => {
      e.preventDefault()
      setDragOverZone(null)
      try {
        const data = JSON.parse(e.dataTransfer.getData('application/json') || '{}')
        if (data.kind !== 'field' || !data.tableName || !data.fieldName) return

        const table = ensureTableOnCanvas(data.tableName)
        if (!table) return
        const field = table.fields.find((f) => f.name === data.fieldName)
        if (!field) return

        if (zone === 'columns') {
          setColumns((prev) => {
            if (prev.some((c) => c.tableId === table.id && c.field.name === field.name)) return prev
            return [...prev, { id: generateId(), tableId: table.id, tableName: table.tableName, field }]
          })
        } else if (zone === 'filters') {
          setFilters((prev) => [
            ...prev,
            { id: generateId(), tableId: table.id, tableName: table.tableName, field, operator: '=', value: '' },
          ])
        } else if (zone === 'sort') {
          setSort({ tableId: table.id, field, direction: 'ASC' })
        }
      } catch {
        // ignore
      }
    },
    [ensureTableOnCanvas]
  )

  const removeTable = (id) => {
    setTables((prev) => prev.filter((t) => t.id !== id))
    setJoins((prev) => prev.filter((j) => j.fromTableId !== id && j.toTableId !== id))
    setColumns((prev) => prev.filter((c) => c.tableId !== id))
    setFilters((prev) => prev.filter((f) => f.tableId !== id))
    if (sort.tableId === id) setSort({ tableId: '', field: null, direction: 'ASC' })
  }

  const updateJoin = (id, patch) => {
    setJoins((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)))
  }

  const removeColumn = (id) => setColumns((prev) => prev.filter((c) => c.id !== id))
  const removeFilter = (id) => setFilters((prev) => prev.filter((f) => f.id !== id))
  const updateFilter = (id, patch) =>
    setFilters((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))

  const joinLines = joins.map((join) => {
    const from = tables.find((t) => t.id === join.fromTableId)
    const to = tables.find((t) => t.id === join.toTableId)
    if (!from || !to) return null
    const x1 = from.x + 120
    const y1 = from.y + 40
    const x2 = to.x + 120
    const y2 = to.y + 40
    return { ...join, x1, y1, x2, y2 }
  })

  const fieldPill = (item, onRemove, extra) => (
    <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-1 text-xs font-medium text-cyan-700 border border-cyan-100">
      {item.tableName}.{item.field.englishName || item.field.name}
      {extra}
      <button onClick={onRemove} className="ml-1 rounded-full p-0.5 hover:bg-cyan-100">
        <X className="h-3 w-3" />
      </button>
    </span>
  )

  const dropzone = (zone, title, icon, children) => {
    const active = dragOverZone === zone
    return (
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOverZone(zone)
        }}
        onDragLeave={() => setDragOverZone(null)}
        onDrop={handleDropzoneDrop(zone)}
        className={`flex flex-1 flex-col gap-2 rounded-lg border p-3 transition-colors ${
          active ? 'border-cyan-400 bg-cyan-50/60' : 'border-slate-200 bg-white'
        }`}
      >
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          {icon}
          {title}
        </div>
        <div className="flex flex-wrap content-start gap-2">{children}</div>
        {children.length === 0 && (
          <div className="flex flex-1 items-center justify-center text-[11px] text-slate-400">
            拖拽字段到此处
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col h-full w-full overflow-hidden">
      {/* 上半区：数据模型画布 */}
      <div
        ref={canvasRef}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleCanvasDrop}
        onDragEnter={() => setCanvasHover(true)}
        onDragLeave={() => setCanvasHover(false)}
        className="relative h-[35%] min-h-[250px] w-full overflow-hidden border-b border-dashed border-slate-300 bg-slate-50 shadow-inner"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {tables.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <LayoutGrid className="mb-2 h-8 w-8 opacity-40" />
            <p className="text-sm">从左侧拖拽数据表至此进行关联</p>
          </div>
        )}

        {/* Join 连线 */}
        <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full">
          {joinLines.map(
            (line) =>
              line && (
                <g key={line.id}>
                  <line
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke="#94a3b8"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                  />
                  <circle cx={line.x1} cy={line.y1} r={3} fill="#94a3b8" />
                  <circle cx={line.x2} cy={line.y2} r={3} fill="#94a3b8" />
                </g>
              )
          )}
        </svg>

        {/* Join 配置按钮（连线中点） */}
        {joinLines.map(
          (line) =>
            line && (
              <button
                key={`btn-${line.id}`}
                style={{ left: (line.x1 + line.x2) / 2 - 12, top: (line.y1 + line.y2) / 2 - 12 }}
                onClick={() => setEditingJoin(line.id)}
                className="absolute z-10 flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-cyan-300 hover:text-cyan-600"
              >
                <Settings2 className="h-3 w-3" />
              </button>
            )
        )}

        {/* 表卡片 */}
        {tables.map((table) => (
          <div
            key={table.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/json', JSON.stringify({ kind: 'table', name: table.name }))
            }}
            style={{ left: table.x, top: table.y }}
            className="absolute z-20 w-[240px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-3 py-2">
              <div className="flex items-center gap-1.5">
                <Table2 className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-700">{table.name}</span>
              </div>
              <button
                onClick={() => removeTable(table.id)}
                className="rounded p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <div className="max-h-[140px] overflow-y-auto p-1.5">
              {table.fields.map((field) => (
                <div
                  key={field.name}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(
                      'application/json',
                      JSON.stringify({ kind: 'field', tableId: table.id, fieldName: field.name })
                    )
                  }}
                  className="group flex cursor-grab items-center gap-1 rounded px-1.5 py-1 text-[11px] text-slate-600 hover:bg-cyan-50 hover:text-cyan-700"
                >
                  <GripVertical className="h-3 w-3 shrink-0 text-slate-300 group-hover:text-cyan-400" />
                  <span className="truncate">
                    {field.name}
                    {field.englishName && (
                      <span className="ml-1 text-[10px] text-slate-400">({field.englishName})</span>
                    )}
                    {field.enumValues && (
                      <span className="ml-1 text-[10px] text-slate-400">({field.enumValues})</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {canvasHover && tables.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-cyan-500/5" />
        )}
      </div>

      {/* 中间区：分析配置盘 */}
      <div className="flex h-[25%] w-full flex-col gap-3 overflow-hidden border-b border-slate-200 bg-slate-50/50 p-4">
        <div className="flex shrink-0 items-center gap-2 text-xs font-semibold text-slate-500">
          <LayoutGrid className="h-3.5 w-3.5" />
          分析配置盘
        </div>

        <div className="flex flex-row gap-4 w-full h-full min-h-0">
          {dropzone(
            'columns',
            '显示字段',
            <LayoutGrid className="h-3.5 w-3.5 text-cyan-600" />,
            columns.map((c) =>
              fieldPill(c, () => removeColumn(c.id), (
                <span className="text-[10px] text-cyan-500/80">{c.field.dataType}</span>
              ))
            )
          )}

          {dropzone(
            'filters',
            '过滤条件',
            <Filter className="h-3.5 w-3.5 text-amber-600" />,
            filters.map((f) => (
              <div
                key={f.id}
                className="inline-flex items-center gap-1 rounded-full border border-amber-100 bg-amber-50 px-2 py-1 text-xs text-amber-700"
              >
                <span className="max-w-[80px] truncate">{f.tableName}.{f.field.englishName || f.field.name}</span>
                <select
                  value={f.operator}
                  onChange={(e) => updateFilter(f.id, { operator: e.target.value })}
                  className="h-5 rounded border border-amber-200 bg-white px-1 text-[10px] outline-none"
                >
                  {FILTER_OPS.map((op) => (
                    <option key={op} value={op}>
                      {op}
                    </option>
                  ))}
                </select>
                <input
                  value={f.value}
                  onChange={(e) => updateFilter(f.id, { value: e.target.value })}
                  placeholder="值"
                  className="h-5 w-16 rounded border border-amber-200 bg-white px-1 text-[10px] outline-none"
                />
                <button onClick={() => removeFilter(f.id)} className="ml-0.5 rounded-full p-0.5 hover:bg-amber-100">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))
          )}

          {dropzone(
            'sort',
            '排序与限制',
            <ArrowUpDown className="h-3.5 w-3.5 text-indigo-600" />,
            sort.field
              ? [
                  <span
                    key="sort"
                    className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-2 py-1 text-xs text-indigo-700"
                  >
                    {sort.tableName}.{sort.field.englishName || sort.field.name}
                    <select
                      value={sort.direction}
                      onChange={(e) => setSort((s) => ({ ...s, direction: e.target.value }))}
                      className="h-5 rounded border border-indigo-200 bg-white px-1 text-[10px] outline-none"
                    >
                      <option value="ASC">升序</option>
                      <option value="DESC">降序</option>
                    </select>
                    <button
                      onClick={() => setSort({ tableId: '', field: null, direction: 'ASC' })}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-indigo-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>,
                  <span key="limit" className="inline-flex items-center gap-1 text-xs text-slate-600">
                    LIMIT
                    <input
                      type="number"
                      value={limit}
                      onChange={(e) => setLimit(Number(e.target.value))}
                      className="h-6 w-16 rounded border border-slate-200 px-1 text-xs outline-none"
                    />
                  </span>,
                ]
              : []
          )}
        </div>
      </div>

      {/* 下半区：结果面板 */}
      <ResultPanel
        showResult={showResult}
        isRunning={isRunning}
        resultColumns={resultColumns}
        resultRows={resultRows}
        executionMeta={executionMeta}
      />

      {/* Join 配置 Popover */}
      {editingJoin && (
        <JoinEditor
          join={joins.find((j) => j.id === editingJoin)}
          tables={tables}
          onChange={(patch) => updateJoin(editingJoin, patch)}
          onClose={() => setEditingJoin(null)}
        />
      )}
    </div>
  )
}

function JoinEditor({ join, tables, onChange, onClose }) {
  if (!join) return null
  const fromTable = tables.find((t) => t.id === join.fromTableId)
  const toTable = tables.find((t) => t.id === join.toTableId)
  if (!fromTable || !toTable) return null

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px]">
      <div className="w-[360px] rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-800">配置表关联</h4>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-500">Join 方式</label>
            <select
              value={join.joinType}
              onChange={(e) => onChange({ joinType: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none"
            >
              {JOIN_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-500">{fromTable.name}</label>
              <select
                value={join.fromField}
                onChange={(e) => onChange({ fromField: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none"
              >
                <option value="">选择字段</option>
                {fromTable.fields.map((f) => (
                  <option key={f.name} value={f.englishName || f.name}>
                    {f.name} ({f.englishName || f.name})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-slate-500">{toTable.name}</label>
              <select
                value={join.toField}
                onChange={(e) => onChange({ toField: e.target.value })}
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs outline-none"
              >
                <option value="">选择字段</option>
                {toTable.fields.map((f) => (
                  <option key={f.name} value={f.englishName || f.name}>
                    {f.name} ({f.englishName || f.name})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:from-cyan-600 hover:to-blue-700"
            >
              确认
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
