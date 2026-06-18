import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Search,
  Paperclip,
  ArrowUp,
  BarChart3,
  Code2,
  Bot,
  FileText,
  Network,
  Database,
  ChevronDown,
  X,
} from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { mockSearchResults, getResourceById, nodeTypes } from '@/data/mockData'

const suggestions = [
  { icon: Sparkles, text: '帮我查上月已确认的订舱总重' },
  { icon: BarChart3, text: '分析最近一周集装箱吞吐量趋势' },
  { icon: Search, text: '查找报关相关数据' },
]

const intents = [
  { id: 'find', label: '探索数据', icon: Search },
  { id: 'ai', label: 'AI 问数', icon: Bot },
]

const quickNavs = [
  { id: 'analysis', label: '自助分析', icon: BarChart3, color: 'from-blue-500 to-cyan-500' },
  { id: 'develop', label: '自助开发', icon: Code2, color: 'from-violet-500 to-purple-500' },
]

const searchResultIds = ['t2', 'm2', 'a2', 'd1']

const typeIcons = {
  table: FileText,
  metric: BarChart3,
  api: Network,
  dataset: Database,
}

export function HeroSection() {
  const navigate = useNavigate()
  const { setSection, setSelectedResource } = useAppStore()
  const [input, setInput] = useState('报关')
  const [intent, setIntent] = useState('find')
  const [showResults, setShowResults] = useState(true)
  const textareaRef = useRef(null)
  const boxRef = useRef(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.focus()
      textarea.setSelectionRange(input.length, input.length)
    }
  }, [input.length])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSend = () => {
    if (!input.trim()) return
    if (intent === 'find') {
      setShowResults(true)
    } else if (intent === 'ai') {
      navigate('/analysis', { state: { question: input.trim() } })
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    } else if (e.key === 'Escape') {
      setShowResults(false)
    }
  }

  const handleSelect = (item) => {
    const resource = getResourceById(item.id)
    if (resource) {
      setSelectedResource(resource)
    }
  }

  const handleNav = (nav) => {
    if (nav.id === 'analysis') {
      navigate('/analysis')
    } else if (nav.id === 'develop') {
      window.open(
        'http://192.168.120.183:9449/esp/#/taskCenter/21329320172928/workflow/definition/21671976785408',
        '_blank'
      )
    }
  }

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#F8FAFC] to-[#FFFFFF] px-4 py-12">
      {/* 极细几何点阵纹理 */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(circle at center, #94a3b8 0.5px, transparent 0.5px)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 75%)',
        }}
      />

      {/* 柔和光晕 */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/3 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-200/15 blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 h-[26rem] w-[26rem] translate-x-1/3 translate-y-1/3 rounded-full bg-blue-200/15 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 flex w-full max-w-3xl flex-col items-center"
      >
        {/* 品牌招呼 */}
        <div className="mb-6 text-center">
          <h1 className="bg-gradient-to-r from-[#18FFFF] to-[#2979FF] bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl">
            Hi，欢迎进入数据开放区
          </h1>
        </div>

        {/* 智能推荐胶囊 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-4 flex flex-wrap items-center justify-center gap-2"
        >
          {suggestions.map((s, idx) => {
            const Icon = s.icon
            return (
              <button
                key={idx}
                onClick={() => {
                  setInput(s.text)
                  setIntent('ai')
                  textareaRef.current?.focus()
                }}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-600 backdrop-blur-sm transition-all hover:border-cyan-200 hover:bg-white hover:text-cyan-700 hover:shadow-sm"
              >
                <Icon className="h-3.5 w-3.5" />
                {s.text}
              </button>
            )
          })}
        </motion.div>

        {/* Omni-Box */}
        <motion.div
          ref={boxRef}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="relative w-full"
        >
          <div className="relative rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50 transition-shadow focus-within:shadow-xl focus-within:shadow-cyan-100/50">
            {/* 输入区 */}
            <div className="relative p-4 pb-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  setShowResults(e.target.value.length > 0)
                }}
                onFocus={() => setShowResults(input.length > 0)}
                onKeyDown={handleKeyDown}
                rows={3}
                className="w-full resize-none border-0 bg-transparent text-base leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                placeholder="搜数据、问指标，或让 AI 帮您直接写 SQL..."
              />
              {input && (
                <button
                  onClick={() => {
                    setInput('')
                    setShowResults(false)
                  }}
                  className="absolute right-4 top-4 rounded-full p-0.5 text-slate-300 hover:bg-slate-100 hover:text-slate-500"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* 工具栏 */}
            <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
              {/* 左侧意图切换 */}
              <div className="flex items-center gap-1">
                {intents.map((item) => {
                  const Icon = item.icon
                  const active = intent === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setIntent(item.id)
                        if (item.id === 'find') {
                          setShowResults(input.length > 0)
                        } else {
                          setShowResults(false)
                        }
                      }}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                        active
                          ? item.id === 'find'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-cyan-50 text-cyan-700'
                          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </button>
                  )
                })}
              </div>

              {/* 右侧操作区 */}
              <div className="flex items-center gap-2">
                <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600">
                  <Paperclip className="h-4 w-4" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/20 transition-all hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-40 disabled:shadow-none"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* 搜索结果下拉面板 */}
          <AnimatePresence>
            {showResults && intent === 'find' && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl"
              >
                <div className="max-h-[320px] overflow-auto p-2">
                  {mockSearchResults
                    .filter((item) => searchResultIds.includes(item.id))
                    .map((item) => {
                      const Icon = typeIcons[item.type] || FileText
                      const typeMeta = nodeTypes[item.type]
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelect(item)}
                          className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-slate-50"
                        >
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
                            style={{ backgroundColor: typeMeta?.color || '#64748b' }}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-800">{item.name}</p>
                            <p className="truncate text-[11px] text-slate-400">
                              {typeMeta?.label} · {item.businessDomain} · {item.description.slice(0, 30)}
                              {item.description.length > 30 ? '...' : ''}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 底部快捷入口 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 flex items-center gap-10 sm:gap-16"
        >
          {quickNavs.map((nav) => {
            const Icon = nav.icon
            return (
              <button
                key={nav.id}
                onClick={() => handleNav(nav)}
                className="group flex flex-col items-center gap-2 transition-transform hover:-translate-y-1"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${nav.color} text-white shadow-md shadow-slate-200 transition-shadow group-hover:shadow-lg`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-slate-600 group-hover:text-slate-800">{nav.label}</span>
              </button>
            )
          })}
        </motion.div>
      </motion.div>

      {/* 底部页脚探索条 */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        onClick={() => setSection('graph')}
        className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-2 border-t border-slate-100 bg-white/60 py-3 text-xs text-slate-500 backdrop-blur-sm transition-colors hover:bg-white hover:text-cyan-600"
      >
        <span>向下探索更多数据：全景图谱</span>
        <motion.span
          animate={{ y: [0, 4, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </motion.button>
    </section>
  )
}
