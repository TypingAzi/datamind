import { useRef, useMemo, useState } from 'react'
import { GraphCanvas } from '@/components/GraphCanvas'
import { useAppStore } from '@/stores/appStore'
import {
  Home,
  RotateCcw,
  Maximize,
  Eye,
  EyeOff,
  ChevronDown,
  X,
} from 'lucide-react'
import { graphData, fieldGraphData, nodeTypes, linkTypes } from '@/data/mockData'
import { motion, AnimatePresence, useDragControls } from 'framer-motion'

const linkTypeOrder = ['flow', 'belong', 'lineage', 'semantic']

export function GraphSection() {
  const canvasRef = useRef(null)
  const { setSection, graphLevel, setGraphLevel, graphVisibility, toggleGraphVisibility, graphLinkVisibility, toggleGraphLinkVisibility } =
    useAppStore()

  const [collapsed, setCollapsed] = useState(false)
  const [showFieldPopover, setShowFieldPopover] = useState(false)
  const dragControls = useDragControls()

  const nodeCounts = useMemo(() => {
    const counts = {}
    Object.keys(nodeTypes).forEach((t) => {
      if (t === 'field') counts[t] = fieldGraphData.fields.length
      else if (t === 'flow') counts[t] = graphData.nodes.filter((n) => n.type === 'flow').length
      else counts[t] = graphData.nodes.filter((n) => n.type === t).length
    })
    return counts
  }, [])

  const linkCounts = useMemo(() => {
    const counts = {}
    linkTypeOrder.forEach((t) => {
      if (t === 'flow') counts[t] = graphData.links.filter((l) => !l.type || l.type === 'flow').length
      else if (t === 'belong') counts[t] = graphData.links.filter((l) => l.type === 'belong').length
      else counts[t] = fieldGraphData.links.filter((l) => l.type === t).length
    })
    return counts
  }, [])

  const visibleNodeCount = useMemo(() => {
    let count = graphData.nodes.filter((n) => graphVisibility[n.type]).length
    if (graphLevel === 'L3' && graphVisibility.field) count += fieldGraphData.fields.length
    return count
  }, [graphVisibility, graphLevel])

  const visibleLinkCount = useMemo(() => {
    let count = graphData.links.filter((l) => graphLinkVisibility[l.type || 'flow']).length
    if (graphLevel === 'L3') {
      count += fieldGraphData.links.filter((l) => graphLinkVisibility[l.type]).length
      count += fieldGraphData.fields.length
    }
    return count
  }, [graphLinkVisibility, graphLevel])

  return (
    <section className="relative h-screen w-screen overflow-hidden bg-slate-50">
      {/* 全屏画布 */}
      <div className="absolute inset-0">
        <GraphCanvas ref={canvasRef} />
      </div>

      {/* 顶部标题 */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-white/90 via-white/60 to-transparent px-8 py-5 backdrop-blur-sm pointer-events-none">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">航贸知识图谱</h2>
          <p className="mt-1 text-sm text-slate-500">Shipping &amp; Trade Knowledge Graph</p>
        </div>
      </div>

      {/* 悬浮图层面板 */}
      <motion.div
        drag
        dragControls={dragControls}
        dragListener={collapsed}
        dragMomentum={false}
        initial={{ opacity: 0.9, scale: 1 }}
        whileHover={{ opacity: 1 }}
        whileDrag={{ scale: 1.02, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className={`absolute left-6 top-20 z-50 flex flex-col overflow-hidden border border-white/10 bg-slate-900/85 shadow-2xl backdrop-blur-xl ${
          collapsed ? 'h-12 w-12 rounded-full' : 'w-[260px] max-h-[80vh] rounded-2xl'
        }`}
      >
        <AnimatePresence mode="wait">
          {collapsed ? (
            <motion.button
              key="fab"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              onClick={() => setCollapsed(false)}
              className="flex h-full w-full items-center justify-center text-sm font-bold text-white"
              title="展开图层面板"
            >
              {graphLevel}
            </motion.button>
          ) : (
            <motion.div
              key="panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col"
            >
              {/* 标题栏 / 拖拽把手 */}
              <div
                onPointerDown={(e) => dragControls.start(e)}
                className="flex cursor-move items-center justify-between border-b border-white/10 px-3 py-2.5"
              >
                <span className="text-sm font-bold text-slate-200">图层导航</span>
                <button
                  onClick={() => setCollapsed(true)}
                  title="收起"
                  className="flex h-5 w-5 items-center justify-center rounded text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              {/* 面板内容 */}
              <div className="flex-1 overflow-y-auto p-3">
                {/* 统计区 */}
                <div className="flex items-center border-b border-white/10 pb-3">
                  <div className="flex flex-1 flex-col items-center">
                    <span className="text-[32px] font-bold leading-none text-white">{visibleNodeCount}</span>
                    <span className="mt-1 text-xs text-slate-400">实体数量</span>
                  </div>
                  <div className="flex flex-1 flex-col items-center">
                    <span className="text-[32px] font-bold leading-none text-white">{visibleLinkCount}</span>
                    <span className="mt-1 text-xs text-slate-400">关系数量</span>
                  </div>
                </div>

                {/* 层级控制 */}
                <div className="py-3">
                  <div className="flex rounded-lg bg-slate-800 p-1">
                    {['L1', 'L2', 'L3'].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setGraphLevel(lvl)}
                        className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
                          graphLevel === lvl
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 节点类型 */}
                <div>
                  <h3 className="mb-2 mt-1 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                    节点类型
                  </h3>
                  <div className="space-y-0.5">
                    {Object.entries(nodeTypes)
                      .filter(([key]) => key !== 'field')
                      .map(([key, meta]) => (
                        <LegendItem
                          key={key}
                          meta={meta}
                          count={nodeCounts[key]}
                          visible={graphVisibility[key]}
                          onToggle={() => toggleGraphVisibility(key)}
                        />
                      ))}

                    {/* 字段折叠项 */}
                    <div className="relative">
                      <div
                        className={`flex h-9 w-full items-center justify-between rounded-md px-2 transition-colors ${
                          graphLevel !== 'L3'
                            ? 'cursor-not-allowed opacity-40'
                            : 'hover:bg-white/5'
                        }`}
                      >
                        <button
                          disabled={graphLevel !== 'L3'}
                          onClick={() => graphLevel === 'L3' && setShowFieldPopover((s) => !s)}
                          className="flex flex-1 items-center gap-2 text-left"
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: nodeTypes.field.color }}
                          />
                          <span className="text-[13px] text-slate-300">{nodeTypes.field.label}</span>
                        </button>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-500">
                            {nodeCounts.field}
                          </span>
                          <button
                            disabled={graphLevel !== 'L3'}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (graphLevel === 'L3') toggleGraphVisibility('field')
                            }}
                            className="text-slate-400 hover:text-white disabled:cursor-not-allowed"
                          >
                            {graphVisibility.field ? (
                              <Eye className="h-3.5 w-3.5 text-blue-500" />
                            ) : (
                              <EyeOff className="h-3.5 w-3.5 text-slate-500" />
                            )}
                          </button>
                        </div>
                      </div>

                      <AnimatePresence>
                        {showFieldPopover && graphLevel === 'L3' && (
                          <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            className="absolute left-full top-0 z-50 ml-2 w-64 rounded-xl border border-white/10 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-md"
                          >
                            <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
                              <span className="text-xs font-medium text-white">字段明细</span>
                              <button
                                onClick={() => setShowFieldPopover(false)}
                                className="text-slate-400 hover:text-white"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div className="max-h-[320px] space-y-1 overflow-y-auto pr-1">
                              {fieldGraphData.fields.map((f) => (
                                <div
                                  key={f.id}
                                  className="flex items-center gap-2 rounded px-1.5 py-1 text-[11px] text-slate-300 hover:bg-white/5"
                                >
                                  <span
                                    className="h-1.5 w-1.5 rounded-full"
                                    style={{
                                      backgroundColor:
                                        nodeTypes[graphData.nodes.find((n) => n.id === f.parent)?.type]?.color ||
                                        '#64748b',
                                    }}
                                  />
                                  <span className="truncate" title={f.labelCn || f.label}>
                                    {f.labelCn || f.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* 关系类型 */}
                <div className="pb-1">
                  <h3 className="mb-2 mt-5 text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                    关系类型
                  </h3>
                  <div className="space-y-0.5">
                    {linkTypeOrder.map((key) => (
                      <LinkLegendItem
                        key={key}
                        meta={linkTypes[key]}
                        count={linkCounts[key]}
                        visible={graphLinkVisibility[key]}
                        disabled={(key === 'lineage' || key === 'semantic') && graphLevel !== 'L3'}
                        onToggle={() => toggleGraphLinkVisibility(key)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* 右侧悬浮控制按钮 */}
      <div className="absolute right-6 top-24 z-40 flex flex-col gap-3">
        <button
          onClick={() => canvasRef.current?.resetView()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-lg transition-all hover:bg-cyan-50 hover:text-cyan-600 hover:shadow-xl"
          title="重置视图"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          onClick={() => canvasRef.current?.fitView()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-lg transition-all hover:bg-cyan-50 hover:text-cyan-600 hover:shadow-xl"
          title="适应画布"
        >
          <Maximize className="h-4 w-4" />
        </button>
        <button
          onClick={() => setSection('hero')}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-lg transition-all hover:bg-cyan-50 hover:text-cyan-600 hover:shadow-xl"
          title="回到首页"
        >
          <Home className="h-4 w-4" />
        </button>
      </div>

      {/* L3 操作提示 */}
      <AnimatePresence>
        {graphLevel === 'L3' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full border border-cyan-200 bg-white/90 px-4 py-2 text-xs text-cyan-700 shadow-lg backdrop-blur-md"
          >
            双击资源节点可展开/收起字段级节点
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function LegendItem({ meta, count, visible, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`flex h-9 w-full items-center justify-between rounded-md px-2 transition-colors hover:bg-white/5 ${
        visible ? '' : 'opacity-50'
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{
            backgroundColor: meta.premium ? 'transparent' : meta.color,
            border: meta.premium ? `2px solid ${meta.color}` : 'none',
          }}
        />
        <span className="text-[13px] text-slate-300">{meta.label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-500">{count}</span>
        {visible ? (
          <Eye className="h-3.5 w-3.5 text-blue-500" />
        ) : (
          <EyeOff className="h-3.5 w-3.5 text-slate-500" />
        )}
      </div>
    </button>
  )
}

function LinkLegendItem({ meta, count, visible, disabled, onToggle }) {
  return (
    <button
      disabled={disabled}
      onClick={onToggle}
      className={`flex h-9 w-full items-center justify-between rounded-md px-2 transition-colors ${
        disabled
          ? 'cursor-not-allowed opacity-40'
          : `hover:bg-white/5 ${visible ? '' : 'opacity-50'}`
      }`}
    >
      <div className="flex items-center gap-3">
        <svg width="20" height="10" className="shrink-0">
          <line
            x1="0"
            y1="5"
            x2="20"
            y2="5"
            stroke={meta.color}
            strokeWidth={meta.width}
            strokeDasharray={meta.dash}
          />
          {meta.arrow && <polygon points="20,5 15,2.5 15,7.5" fill={meta.color} />}
        </svg>
        <span className="text-[13px] text-slate-300">{meta.label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[11px] text-slate-500">{count}</span>
        {visible ? (
          <Eye className="h-3.5 w-3.5 text-blue-500" />
        ) : (
          <EyeOff className="h-3.5 w-3.5 text-slate-500" />
        )}
      </div>
    </button>
  )
}
