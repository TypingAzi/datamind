import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import {
  Play,
  AlignLeft,
  Save,
  BarChart3,
  Search,
  Database,
  Table,
  FileText,
  ChevronRight,
  ChevronDown,
  Loader2,
  ArrowLeft,
  FolderOpen,
  Globe,
  Plus,
  LayoutDashboard,
  Code2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VisualBuilder } from '@/components/VisualBuilder'
import { ResultPanel } from '@/components/ResultPanel'
import { useAppStore } from '@/stores/appStore'
import { schemaTree, resultColumns, resultRows, executionMeta } from '@/data/workbenchMock'

const sectionMeta = {
  public: { Icon: FolderOpen, label: '公共数据', color: 'text-slate-600', bg: 'bg-slate-100' },
  dimensional: { Icon: Globe, label: '维度数据', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  'self-service': { Icon: Database, label: '自助开发数据', color: 'text-indigo-600', bg: 'bg-indigo-50' },
}

const typeIcons = {
  root: Database,
  section: Database,
  table: Table,
  field: FileText,
}

function TreeNode({ node, level = 0, onDoubleClick, searchQuery, onFieldHover, sectionType, parentTable }) {
  const [expanded, setExpanded] = useState(level < 2)
  const currentSectionType = node.sectionType || sectionType

  const matches =
    !searchQuery ||
    node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (node.tableName && node.tableName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (node.englishName && node.englishName.toLowerCase().includes(searchQuery.toLowerCase()))

  const childMatches =
    node.children &&
    node.children.some((child) => {
      if (!searchQuery) return true
      return (
        child.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (child.comment && child.comment.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (child.englishName && child.englishName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (child.enumValues && child.enumValues.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    })

  if (searchQuery && !matches && !childMatches) return null

  const isRoot = node.type === 'root'
  const isSection = node.type === 'section'
  const isDimensional = currentSectionType === 'dimensional'

  let Icon = typeIcons[node.type] || FileText
  let iconColorClass = 'text-slate-500'

  if (isSection) {
    const meta = sectionMeta[currentSectionType]
    if (meta) {
      Icon = meta.Icon
      iconColorClass = meta.color
    }
  }

  const paddingLeft = isRoot ? 8 : level * 14 + 8

  const renderLabel = () => {
    if (node.type === 'field' && (currentSectionType === 'public' || currentSectionType === 'self-service') && node.englishName) {
      return (
        <span className="truncate text-[13px]">
          {node.name}
          <span className="ml-1 text-[11px] text-slate-400">({node.englishName})</span>
        </span>
      )
    }
    if (node.type === 'field' && isDimensional && node.enumValues) {
      return (
        <span className="truncate text-[13px]">
          {node.name}
          <span className="ml-1 text-[11px] text-slate-400">({node.enumValues})</span>
        </span>
      )
    }
    return (
      <span className="truncate text-[13px]">
        {node.name}
        {node.tableName && <span className="ml-1 text-[11px] text-slate-400">({node.tableName})</span>}
        {node.type === 'field' && !node.englishName && !node.enumValues && (
          <span className="ml-1 text-[11px] text-slate-400">[{node.dataType}]</span>
        )}
        {node.isNew && (
          <span className="ml-1.5 rounded bg-green-100 px-1 py-0 text-[10px] font-medium text-green-700">
            New
          </span>
        )}
      </span>
    )
  }

  const rowClass = isSection
    ? `group flex cursor-pointer items-center gap-1.5 px-2 py-1.5 text-xs font-semibold transition-colors ${sectionMeta[currentSectionType]?.bg || 'bg-slate-50'} text-slate-700 hover:bg-slate-100`
    : 'group flex cursor-pointer items-center gap-1 py-1 pr-2 text-slate-700 transition-colors hover:bg-[#F0F4FF]'

  return (
    <div>
      {!isRoot && (
        <div
          style={{ paddingLeft }}
          draggable={node.type === 'table' || node.type === 'field'}
          onDragStart={(e) => {
            const payload =
              node.type === 'table'
                ? { kind: 'table', name: node.name, tableName: node.tableName }
                : { kind: 'field', tableName: parentTable?.tableName || node.tableName, fieldName: node.name }
            e.dataTransfer.setData('application/json', JSON.stringify(payload))
          }}
          onClick={() => node.children && setExpanded(!expanded)}
          onDoubleClick={() => onDoubleClick(node)}
          onMouseEnter={(e) => onFieldHover && onFieldHover(e, node)}
          onMouseMove={(e) => onFieldHover && onFieldHover(e, node)}
          onMouseLeave={() => onFieldHover && onFieldHover(null, null)}
          className={rowClass}
        >
          {node.children ? (
            expanded ? (
              <ChevronDown className="h-3 w-3 text-slate-400" />
            ) : (
              <ChevronRight className="h-3 w-3 text-slate-400" />
            )
          ) : (
            <span className="w-3" />
          )}
          <Icon className={`h-3.5 w-3.5 shrink-0 ${iconColorClass}`} />
          {renderLabel()}
        </div>
      )}
      {expanded && node.children && (
        <div>
          {currentSectionType === 'self-service' && (
            <div style={{ paddingLeft: paddingLeft + 14 }} className="py-1 pr-2">
              <button className="flex w-full items-center justify-center gap-1 rounded border border-dashed border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-500 transition-colors hover:border-cyan-300 hover:text-cyan-600">
                <Plus className="h-3 w-3" />
                上传文件
              </button>
            </div>
          )}
          {node.children.map((child, idx) => (
            <TreeNode
              key={idx}
              node={child}
              level={isRoot ? 0 : level + 1}
              onDoubleClick={onDoubleClick}
              searchQuery={searchQuery}
              onFieldHover={onFieldHover}
              sectionType={currentSectionType}
              parentTable={node.type === 'table' ? node : parentTable}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FieldTooltip({ field, style }) {
  if (!field) return null
  return (
    <div style={style} className="pointer-events-none fixed z-50 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-slate-800">{field.name}</p>
      <p className="text-slate-500">字段注释：{field.comment}</p>
      {field.enumValues && <p className="text-slate-400">枚举值域：{field.enumValues}</p>}
    </div>
  )
}

function ModeSwitcher({ mode, onChange }) {
  return (
    <div className="flex items-center rounded-lg bg-slate-100 p-0.5">
      <button
        onClick={() => onChange('visual')}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
          mode === 'visual'
            ? 'bg-white text-cyan-700 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <LayoutDashboard className="h-3.5 w-3.5" />
        可视化构建
      </button>
      <button
        onClick={() => onChange('sql')}
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
          mode === 'sql'
            ? 'bg-white text-cyan-700 shadow-sm'
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        <Code2 className="h-3.5 w-3.5" />
        SQL 视图
      </button>
    </div>
  )
}

function buildDefaultSql(tableName, fields = []) {
  const cols = fields.length > 0 ? '\n  ' + fields.map((f) => f.englishName || f.name).join(',\n  ') : '\n  *'
  return `-- 自动为您生成初始查询\nSELECT${cols}\nFROM public_db.${tableName}\nLIMIT 100;`
}

function resolveInitialTable(location, selectedResource) {
  const stateName = location.state?.tableName
  const storeName = selectedResource?.name
  const name = stateName || storeName
  if (!name) return null
  const sections = schemaTree.children || []
  for (const section of sections) {
    const table = section.children?.find((t) => t.name === name)
    if (table) return { ...table, sectionType: section.sectionType }
  }
  // 按名称模糊匹配兜底
  for (const section of sections) {
    const table = section.children?.find((t) => name.includes(t.name) || t.name.includes(name))
    if (table) return { ...table, sectionType: section.sectionType }
  }
  return null
}

export function AnalysisWorkbench() {
  const navigate = useNavigate()
  const location = useLocation()
  const editorRef = useRef(null)
  const { selectedResource } = useAppStore()

  const initialTable = resolveInitialTable(location, selectedResource)
  const defaultSql = initialTable
    ? buildDefaultSql(initialTable.tableName || initialTable.name, initialTable.children)
    : buildDefaultSql('t_import_declaration', [])

  const [mode, setMode] = useState('visual')
  const [sql, setSql] = useState(defaultSql)
  const visualSqlRef = useRef(defaultSql)
  const [isRunning, setIsRunning] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [treeSearch, setTreeSearch] = useState('')
  const [hoveredField, setHoveredField] = useState(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })

  const handleModeChange = (newMode) => {
    if (newMode === 'sql' && mode === 'visual') {
      setSql(visualSqlRef.current)
    }
    setMode(newMode)
  }

  // 收集所有表名和字段名用于 Monaco 补全
  const completionItems = useMemo(() => {
    const items = []
    const sections = schemaTree.children || []
    sections.forEach((section) => {
      const tables = section.children || []
      tables.forEach((table) => {
        items.push({
          label: table.tableName || table.name,
          insertText: table.tableName || table.name,
          detail: table.comment,
          kind: 'table',
        })
        table.children.forEach((field) => {
          items.push({
            label: field.englishName || field.name,
            insertText: field.englishName || field.name,
            detail: `${field.comment} (${field.dataType})`,
            kind: 'field',
          })
        })
      })
    })
    return items
  }, [])

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor

    // 高亮提示行
    editor.deltaDecorations(
      [],
      [
        {
          range: new monaco.Range(1, 1, 1, 50),
          options: {
            isWholeLine: true,
            className: 'bg-green-50/60',
            glyphMarginClassName: 'bg-green-100',
          },
        },
      ]
    )

    // 注册 SQL 补全
    monaco.languages.registerCompletionItemProvider('sql', {
      triggerCharacters: ['.', ' ', '\n', '\t'],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        }
        const suggestions = completionItems.map((item) => ({
          label: item.label,
          kind:
            item.kind === 'table'
              ? monaco.languages.CompletionItemKind.Class
              : monaco.languages.CompletionItemKind.Field,
          insertText: item.insertText,
          detail: item.detail,
          range,
        }))
        return { suggestions }
      },
    })
  }

  const handleRun = () => {
    setIsRunning(true)
    setShowResult(true)
    setTimeout(() => {
      setIsRunning(false)
    }, 1200)
  }

  const handleNodeDoubleClick = (node) => {
    if (node.type === 'database') return
    const editor = editorRef.current
    if (!editor || !window.monaco) return
    const text = node.type === 'field' ? node.name : node.tableName || node.name
    const position = editor.getPosition()
    editor.executeEdits('', [
      {
        range: new window.monaco.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column
        ),
        text,
      },
    ])
    editor.focus()
  }

  const handleFieldHover = (e, node) => {
    if (!e || !node || node.type !== 'field') {
      setHoveredField(null)
      return
    }
    setHoveredField(node)
    setTooltipPos({ x: e.clientX + 12, y: e.clientY + 12 })
  }

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') navigate('/')
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [navigate])

  return (
    <>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-white">
        {/* 顶部工具栏：固定高度 56px */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-slate-700">数据开放区 - 自助分析工作台</span>
            <div className="mx-2 h-4 w-px bg-slate-200" />
            <ModeSwitcher mode={mode} onChange={handleModeChange} />
            <div className="mx-2 h-4 w-px bg-slate-200" />
            <Button
              size="sm"
              onClick={handleRun}
              disabled={isRunning}
              className="h-7 gap-1 bg-gradient-to-r from-cyan-500 to-blue-600 px-3 text-xs hover:from-cyan-600 hover:to-blue-700"
            >
              {isRunning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3" />}
              Run (F8)
            </Button>
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-slate-600">
              <AlignLeft className="h-3 w-3" />
              格式化
            </Button>
            <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-slate-600">
              <Save className="h-3 w-3" />
              保存
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() =>
                window.open(
                  'http://192.168.129.11/bi-fe-ui/#/organizations/69a2068935ff48eaaa86d9723a39687f/vizs/chartEditor?dataChartId=&chartType=dataChart&container=dataChart',
                  '_blank'
                )
              }
              className="h-7 gap-1 bg-green-600 px-3 text-xs text-white hover:bg-green-700"
            >
              <BarChart3 className="h-3 w-3" />
              前往可视化分析
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="h-7 gap-1 text-xs text-slate-600"
            >
              <ArrowLeft className="h-3 w-3" />
              返回数据门户
            </Button>
          </div>
        </header>

        {/* 主工作区：左右分栏 */}
        <div className="flex flex-1 flex-row overflow-hidden">
          {/* 左侧 Schema 树：固定宽度 280px，独立滚动 */}
          <aside className="flex w-[280px] shrink-0 flex-col border-r border-slate-200 bg-slate-50/50">
            <div className="border-b border-slate-200 p-2">
              <div className="flex items-center gap-2 rounded border border-slate-200 bg-white px-2 py-1.5">
                <Search className="h-3 w-3 text-slate-400" />
                <input
                  value={treeSearch}
                  onChange={(e) => setTreeSearch(e.target.value)}
                  placeholder="搜索表/字段..."
                  className="flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto py-1">
              <TreeNode
                node={schemaTree}
                onDoubleClick={handleNodeDoubleClick}
                searchQuery={treeSearch}
                onFieldHover={handleFieldHover}
              />
            </div>
          </aside>

          {/* 右边主核心区：编辑器 + 底部结果 */}
          <main className="flex flex-1 flex-col min-w-0 overflow-hidden">
            {/* 上部：可视化构建器 或 SQL 编辑器 + ChatBI */}
            <section className="flex flex-1 flex-col h-full w-full overflow-hidden">
              {mode === 'visual' ? (
                <VisualBuilder
                  key={initialTable?.tableName || 'default'}
                  schemaTree={schemaTree}
                  initialTable={initialTable}
                  onSqlChange={(newSql) => {
                    visualSqlRef.current = newSql
                  }}
                  showResult={showResult}
                  isRunning={isRunning}
                  resultColumns={resultColumns}
                  resultRows={resultRows}
                  executionMeta={executionMeta}
                />
              ) : (
                <>
                  {/* SQL 编辑器 */}
                  <div className="relative flex flex-1 min-w-0 overflow-hidden">
                    <Editor
                      height="100%"
                      width="100%"
                      defaultLanguage="sql"
                      value={sql}
                      onChange={(value) => setSql(value || '')}
                      onMount={handleEditorMount}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbers: 'on',
                        roundedSelection: false,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                        glyphMargin: true,
                      }}
                      theme="vs"
                    />
                  </div>
                  <ResultPanel
                showResult={showResult}
                isRunning={isRunning}
                resultColumns={resultColumns}
                resultRows={resultRows}
                executionMeta={executionMeta}
              />
            </>
          )}
        </section>
      </main>
    </div>
  </div>

      {/* 字段 Tooltip */}
      {hoveredField && <FieldTooltip field={hoveredField} style={{ left: tooltipPos.x, top: tooltipPos.y }} />}
    </>
  )
}

