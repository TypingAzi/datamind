import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  FileText,
  BarChart3,
  Globe,
  Database,
  User,
  GitBranch,
  HardDrive,
  Rows3,
  Clock,
  Shield,
  Lock,
  Sparkles,
  Loader2,
  CheckCircle2,
  Link,
  Code,
  Terminal,
  TrendingUp,
  Activity,
  Zap,
  Copy,
  Check,
  Server,
  Hash,
  FileDown,
  ShieldCheck,
  Layers,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts'
import { useAppStore } from '@/stores/appStore'
import { nodeTypes } from '@/data/mockData'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const typeIcons = {
  table: FileText,
  metric: BarChart3,
  api: Globe,
  dataset: Database,
}

const COLORS = ['#06b6d4', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981']

function formatNumber(num) {
  if (num == null) return '-'
  if (num >= 100000000) return (num / 100000000).toFixed(1) + '亿'
  if (num >= 10000) return (num / 10000).toFixed(1) + '万'
  return num.toLocaleString()
}

export function ResourceDrawer() {
  const navigate = useNavigate()
  const { selectedResource, setSelectedResource, setSelectedNodeId } = useAppStore()

  const closeDrawer = useCallback(() => {
    setSelectedResource(null)
    setSelectedNodeId(null)
  }, [setSelectedResource, setSelectedNodeId])

  const [permissionState, setPermissionState] = useState('idle')
  const [permissionAction, setPermissionAction] = useState(null)
  const [reason, setReason] = useState('')

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeDrawer()
    }
    if (selectedResource) {
      window.addEventListener('keydown', handleEsc)
      return () => window.removeEventListener('keydown', handleEsc)
    }
  }, [selectedResource, setSelectedResource, closeDrawer])

  if (!selectedResource) return null

  const typeMeta = nodeTypes[selectedResource.type]
  const Icon = typeIcons[selectedResource.type] || Database

  const handleActionClick = (action) => {
    setPermissionAction(action)
    setPermissionState('loading')
    setTimeout(() => {
      setPermissionState('denied')
    }, 1200)
  }

  const handleSubmitPermission = () => {
    setPermissionState('loading')
    setTimeout(() => {
      setPermissionState('submitted')
    }, 1200)
  }

  const actionLabel = permissionAction === 'analyze' ? '自助分析' : '自助开发'

  return (
    <AnimatePresence>
      {selectedResource && (
        <div key={selectedResource.id}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-md"
            onClick={() => closeDrawer()}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed left-[2.5%] top-[2.5%] z-50 flex h-[95vh] w-[95vw] flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-8 py-5">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md"
                  style={{ backgroundColor: typeMeta?.color || '#64748b' }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{selectedResource.name}</h2>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className="rounded px-2 py-0.5 text-xs text-white"
                      style={{ backgroundColor: typeMeta?.color || '#64748b' }}
                    >
                      {typeMeta?.label || selectedResource.type}
                    </span>
                    <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                      {selectedResource.securityLevel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {selectedResource.type !== 'api' && (
                  <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-sm">
                    <Sparkles className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-700">数据质量分 {selectedResource.healthScore}</span>
                  </div>
                )}

                {selectedResource.type === 'api' ? (
                  <Button
                    onClick={() => handleActionClick('develop')}
                    disabled={permissionState === 'loading'}
                    className="min-w-[110px] bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                  >
                    {permissionState === 'loading' && permissionAction === 'develop' ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Lock className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    服务申请
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate('/analysis', {
                          state: {
                            tableId: selectedResource?.id,
                            tableName: selectedResource?.name,
                          },
                        })
                        closeDrawer()
                      }}
                      className="min-w-[110px]"
                    >
                      <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
                      自助分析
                    </Button>
                    <Button
                      onClick={() => handleActionClick('develop')}
                      disabled={permissionState === 'loading'}
                      className="min-w-[110px] bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                    >
                      {permissionState === 'loading' && permissionAction === 'develop' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Lock className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      自助开发
                    </Button>
                  </>
                )}

                <button
                  onClick={() => closeDrawer()}
                  className="group ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 hover:text-slate-900"
                >
                  <X className="h-5 w-5 transition-transform group-hover:rotate-90" />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {permissionState === 'denied' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="shrink-0 border-b border-slate-100 bg-amber-50/60 px-8 py-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                      <Lock className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800">权限不足</h4>
                      <p className="text-sm text-slate-500">您当前暂无「{actionLabel}」权限，填写理由后可提交审批。</p>
                      <div className="mt-3 flex items-center gap-3">
                        <input
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="请填写申请理由..."
                          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                        />
                        <Button
                          onClick={handleSubmitPermission}
                          disabled={!reason.trim() || permissionState === 'loading'}
                          className="bg-gradient-to-r from-cyan-500 to-blue-600"
                        >
                          提交申请
                        </Button>
                        <Button variant="ghost" onClick={() => setPermissionState('idle')}>
                          取消
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {permissionState === 'submitted' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="shrink-0 border-b border-slate-100 bg-green-50/60 px-8 py-4"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <p className="text-sm font-medium text-green-700">「{actionLabel}」申请已提交，进入审批流后可继续使用。</p>
                    <Button variant="ghost" size="sm" onClick={() => setPermissionState('idle')}>
                      知道了
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-1 overflow-hidden">
              <div className="w-[25%] shrink-0 overflow-auto border-r border-slate-100 bg-slate-50/50 p-6">
                <h3 className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Database className="h-4 w-4 text-cyan-600" />
                  资产档案
                </h3>

                <div className="space-y-5">
                  <div className="rounded-xl border border-slate-100 bg-white p-4">
                    <p className="mb-2 text-xs font-medium text-slate-400">业务定义</p>
                    <p className="text-sm leading-relaxed text-slate-700">{selectedResource.description}</p>
                  </div>

                  <MetadataItem label="负责人" value={selectedResource.owner} icon={<User className="h-3.5 w-3.5" />} />
                  <MetadataItem label="所属业务节点" value={selectedResource.flowNode} icon={<GitBranch className="h-3.5 w-3.5" />} />
                  <MetadataItem label="存储引擎" value={selectedResource.engine} icon={<HardDrive className="h-3.5 w-3.5" />} />
                  <MetadataItem label="数据总行数" value={formatNumber(selectedResource.totalRows)} icon={<Rows3 className="h-3.5 w-3.5" />} />
                  <MetadataItem label="物理存储" value={selectedResource.storageSize} icon={<HardDrive className="h-3.5 w-3.5" />} />
                  <MetadataItem label="更新频率" value={selectedResource.updateFrequency} icon={<Clock className="h-3.5 w-3.5" />} />
                  <MetadataItem label="安全等级" value={selectedResource.securityLevel} icon={<Shield className="h-3.5 w-3.5" />} />
                </div>
              </div>

              <div className="flex flex-1 flex-col overflow-hidden bg-white">
                {selectedResource.type === 'api' && <ApiDetail resource={selectedResource} />}
                {selectedResource.type === 'metric' && <MetricDetail resource={selectedResource} />}
                {selectedResource.type === 'dataset' && <DatasetDetail resource={selectedResource} />}
                {selectedResource.type === 'table' && <GenericTableDetail resource={selectedResource} />}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function MetadataItem({ label, value, icon }) {
  return (
    <div>
      <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-400">
        {icon}
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  )
}

function ScoreCard({ label, value }) {
  const color = value >= 95 ? 'text-green-600' : value >= 90 ? 'text-cyan-600' : 'text-amber-600'
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-center">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

function ApiDetail({ resource }) {
  const detail = resource.apiDetail
  const [copied, setCopied] = useState(false)
  const peakQps = detail.endpoints.length > 0 ? Math.max(...detail.endpoints.map((ep) => ep.qps)) : 0

  const copyBaseUrl = () => {
    navigator.clipboard.writeText(detail.baseUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Tabs defaultValue="endpoints" className="flex h-full flex-col">
      <TabsList className="mx-6 mt-4 grid w-auto grid-cols-3 bg-slate-50">
        <TabsTrigger value="endpoints" className="text-sm">
          接口
        </TabsTrigger>
        <TabsTrigger value="example" className="text-sm">
          调用示例
        </TabsTrigger>
        <TabsTrigger value="monitor" className="text-sm">
          监控指标
        </TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-auto p-6">
        <TabsContent value="endpoints" className="mt-0 h-full">
          <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="QPS 限制" value={detail.qps} unit="/s" icon={<Zap className="h-4 w-4 text-amber-500" />} />
            <StatCard label="平均延迟" value={detail.avgLatencyMs} unit="ms" icon={<Activity className="h-4 w-4 text-cyan-500" />} />
            <StatCard label="峰值 QPS" value={peakQps} unit="/s" icon={<TrendingUp className="h-4 w-4 text-purple-500" />} />
            <StatCard label="版本" value={detail.version} icon={<Server className="h-4 w-4 text-slate-500" />} />
          </div>

          <div className="mb-4 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">Base URL:</span>
              <code className="rounded bg-white px-2 py-0.5 font-mono text-slate-700">{detail.baseUrl}</code>
            </div>
            <button
              onClick={copyBaseUrl}
              className="flex items-center gap-1 rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-100"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? '已复制' : '复制'}
            </button>
          </div>

          <div className="space-y-3">
            {detail.endpoints.map((ep, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 p-4 transition-shadow hover:shadow-sm">
                <div className="mb-2 flex items-center gap-3">
                  <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">{ep.method}</span>
                  <code className="text-sm font-semibold text-slate-800">{ep.path}</code>
                  <span className="ml-auto text-xs text-slate-400">QPS {ep.qps}</span>
                </div>
                <p className="text-sm text-slate-600">{ep.description}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="example" className="mt-0 h-full">
          <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-2">
            <CodeBlock title="请求示例" method={detail.requestExample.method} path={detail.requestExample.path}>
              {detail.requestExample.body}
            </CodeBlock>
            <CodeBlock title="响应示例" method={`HTTP ${detail.responseExample.status}`}>
              {detail.responseExample.body}
            </CodeBlock>
          </div>
        </TabsContent>

        <TabsContent value="monitor" className="mt-0 h-full">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-5">
              <h4 className="mb-4 text-sm font-semibold text-slate-700">HTTP 状态码分布</h4>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={detail.statusDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {detail.statusDistribution.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-5">
              <h4 className="mb-4 text-sm font-semibold text-slate-700">接口调用量 Top3</h4>
              <div className="space-y-3">
                {detail.endpoints
                  .slice()
                  .sort((a, b) => b.qps - a.qps)
                  .map((ep, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {ep.method} {ep.path}
                        </p>
                        <p className="text-xs text-slate-500">{ep.summary}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">{ep.qps}</p>
                        <p className="text-xs text-slate-500">QPS</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  )
}

function MetricDetail({ resource }) {
  const detail = resource.metricDetail

  return (
    <Tabs defaultValue="definition" className="flex h-full flex-col">
      <TabsList className="mx-6 mt-4 grid w-auto grid-cols-4 bg-slate-50">
        <TabsTrigger value="definition" className="text-sm">
          指标定义
        </TabsTrigger>
        <TabsTrigger value="formula" className="text-sm">
          计算公式
        </TabsTrigger>
        <TabsTrigger value="dimensions" className="text-sm">
          维度口径
        </TabsTrigger>
        <TabsTrigger value="lineage" className="text-sm">
          血缘链路
        </TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-auto p-6">
        <TabsContent value="definition" className="mt-0 h-full">
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="统计粒度" value={detail.granularity} icon={<Hash className="h-4 w-4 text-cyan-500" />} />
            <StatCard label="计量单位" value={detail.unit} icon={<BarChart3 className="h-4 w-4 text-green-500" />} />
            <StatCard label="更新触发" value={detail.updateTrigger} icon={<Clock className="h-4 w-4 text-purple-500" />} />
            <StatCard label="质量分" value={resource.healthScore} icon={<Sparkles className="h-4 w-4 text-amber-500" />} />
          </div>

          <div className="rounded-xl border border-slate-200 p-5">
            <h4 className="mb-4 text-sm font-semibold text-slate-700">近 7 日趋势</h4>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={detail.trend}>
                  <defs>
                    <linearGradient id="metricColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#06b6d4" fillOpacity={1} fill="url(#metricColor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="formula" className="mt-0 h-full">
          <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-5">
              <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Code className="h-4 w-4" />
                计算表达式
              </h4>
              <div className="rounded-lg bg-slate-900 p-4">
                <code className="block whitespace-pre-wrap font-mono text-sm leading-relaxed text-cyan-300">
                  {detail.formula}
                </code>
              </div>
              <p className="mt-4 text-sm text-slate-600">
                <span className="font-semibold text-slate-800">自然语言：</span>
                {detail.formulaPlain}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 p-5">
              <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Terminal className="h-4 w-4" />
                调度信息
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-sm text-slate-500">更新触发</span>
                  <span className="text-sm font-medium text-slate-800">{detail.updateTrigger}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-sm text-slate-500">输出表</span>
                  <code className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                    {resource.schema?.[0]?.dict?.split('.')?.slice(0, 2)?.join('.') || '-'}
                  </code>
                </div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-sm text-slate-500">质量分</span>
                  <span className="text-sm font-bold text-green-600">{resource.healthScore}</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dimensions" className="mt-0 h-full">
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
                <tr>
                  <th className="px-5 py-3">维度名</th>
                  <th className="px-5 py-3">说明</th>
                  <th className="px-5 py-3">基数</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {detail.dimensions.map((dim, idx) => (
                  <tr key={idx} className="bg-white hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{dim.name}</td>
                    <td className="px-5 py-3 text-slate-600">{dim.comment}</td>
                    <td className="px-5 py-3 text-slate-600">{formatNumber(dim.cardinality)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="lineage" className="mt-0 h-full">
          <div className="relative overflow-hidden rounded-xl border border-slate-200 p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <GitBranch className="h-4 w-4 text-cyan-600" />
              指标血缘链路
            </div>
            <div className="space-y-0">
              {detail.metricLineage.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4 pb-6 last:pb-0">
                  {idx !== detail.metricLineage.length - 1 && (
                    <div className="absolute left-[15px] top-8 h-full w-px bg-slate-200" />
                  )}
                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-xs font-bold text-cyan-700">
                    {step.layer}
                  </div>
                  <div className="flex-1 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-semibold text-slate-800">{step.table}</span>
                      <span className="rounded bg-white px-2 py-0.5 text-xs text-slate-500">{step.layer} 层</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">字段: {step.fields.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  )
}

function DatasetDetail({ resource }) {
  const detail = resource.datasetDetail

  return (
    <Tabs defaultValue="dictionary" className="flex h-full flex-col">
      <TabsList className="mx-6 mt-4 grid w-auto grid-cols-4 bg-slate-50">
        <TabsTrigger value="dictionary" className="text-sm">
          数据字典
        </TabsTrigger>
        <TabsTrigger value="sample" className="text-sm">
          样本数据
        </TabsTrigger>
        <TabsTrigger value="quality" className="text-sm">
          质量报告
        </TabsTrigger>
        <TabsTrigger value="usage" className="text-sm">
          使用说明
        </TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-auto p-6">
        <TabsContent value="dictionary" className="mt-0 h-full">
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
                <tr>
                  <th className="px-5 py-3">字段名</th>
                  <th className="px-5 py-3">数据类型</th>
                  <th className="px-5 py-3">注释</th>
                  <th className="px-5 py-3">安全标签</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resource.schema.map((field, idx) => (
                  <tr key={idx} className="bg-white hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{field.field}</td>
                    <td className="px-5 py-3 text-slate-600">{field.type}</td>
                    <td className="px-5 py-3 text-slate-600">{field.comment}</td>
                    <td className="px-5 py-3">
                      {field.sensitive ? (
                        <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                          脱敏
                        </span>
                      ) : (
                        <span className="rounded border border-green-200 bg-green-50 px-2 py-0.5 text-xs text-green-700">
                          公开
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="sample" className="mt-0 h-full">
          <div className="relative overflow-hidden rounded-xl border border-slate-200">
            <div className="pointer-events-none absolute inset-0 z-10 flex rotate-[-12deg] flex-wrap items-center justify-center gap-8 opacity-[0.05]">
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className="text-2xl font-bold text-slate-900">
                  数据预览 · 仅供查看
                </span>
              ))}
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
                <tr>
                  {Object.keys(resource.preview[0] || {}).map((key) => (
                    <th key={key} className="px-5 py-3 capitalize">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resource.preview.map((row, idx) => (
                  <tr key={idx} className="bg-white">
                    {Object.entries(row).map(([key, value]) => (
                      <td key={key} className="px-5 py-3 text-slate-600">
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="mt-0 h-full">
          <div className="mb-5 flex flex-wrap gap-2">
            {detail.qualityTags.map((tag, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700">
                <ShieldCheck className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6 xl:grid-cols-4">
            <ScoreCard label="完整性" value={resource.quality.completeness} />
            <ScoreCard label="唯一性" value={resource.quality.uniqueness} />
            <ScoreCard label="一致性" value={resource.quality.consistency} />
            <ScoreCard label="及时性" value={resource.quality.timeliness} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-5">
              <h4 className="mb-4 text-sm font-semibold text-slate-700">字段空值率</h4>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resource.quality.nullRates}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="field" tick={{ fontSize: 11 }} interval={0} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`${v}%`, '空值率']} />
                    <Bar dataKey="rate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-5">
              <h4 className="mb-4 text-sm font-semibold text-slate-700">枚举值分布</h4>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={resource.quality.enumDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {resource.quality.enumDistribution.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="usage" className="mt-0 h-full">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-4 rounded-xl border border-slate-200 p-5">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <FileDown className="h-4 w-4 text-cyan-600" />
                获取方式
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-cyan-500" />
                  <p className="text-slate-600">{detail.accessMethod}</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-cyan-500" />
                  <p className="text-slate-600">{detail.updatePolicy}</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-cyan-500" />
                  <p className="text-slate-600">{detail.license}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-slate-200 p-5">
              <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Layers className="h-4 w-4 text-cyan-600" />
                适用场景
              </h4>
              <div className="flex flex-wrap gap-2">
                {detail.usageScenarios.map((scene, idx) => (
                  <span key={idx} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {scene}
                  </span>
                ))}
              </div>

              <h4 className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Database className="h-4 w-4 text-cyan-600" />
                关联资产
              </h4>
              <div className="space-y-2">
                {detail.relatedAssets.map((asset, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <span className="text-slate-700">{asset.name}</span>
                    <span className="rounded bg-white px-2 py-0.5 text-xs text-slate-500">{asset.relation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  )
}

function GenericTableDetail({ resource }) {
  const [activeTab, setActiveTab] = useState('schema')
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
      <TabsList className="mx-6 mt-4 grid w-auto grid-cols-3 bg-slate-50">
        <TabsTrigger value="schema" className="text-sm">
          数据结构
        </TabsTrigger>
        <TabsTrigger value="preview" className="text-sm">
          数据预览
        </TabsTrigger>
        <TabsTrigger value="quality" className="text-sm">
          质量探查
        </TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-auto p-6">
        <TabsContent value="schema" className="mt-0 h-full">
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
                <tr>
                  <th className="px-5 py-3">字段名</th>
                  <th className="px-5 py-3">数据类型</th>
                  <th className="px-5 py-3">注释</th>
                  <th className="px-5 py-3">安全标签</th>
                  <th className="px-5 py-3">关联字典</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resource.schema.map((field, idx) => (
                  <tr key={idx} className="bg-white hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{field.field}</td>
                    <td className="px-5 py-3 text-slate-600">{field.type}</td>
                    <td className="px-5 py-3 text-slate-600">{field.comment}</td>
                    <td className="px-5 py-3">
                      {field.sensitive ? (
                        <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                          脱敏
                        </span>
                      ) : (
                        <span className="rounded border border-green-200 bg-green-50 px-2 py-0.5 text-xs text-green-700">
                          公开
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      {field.dict && field.dict.startsWith('dict_') ? (
                        <span className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200">
                          {field.dict}
                          <Link className="ml-0.5 h-3 w-3 text-slate-400" />
                        </span>
                      ) : field.dict ? (
                        <span className="text-xs font-light text-gray-500">{field.dict}</span>
                      ) : (
                        <span className="text-xs text-slate-300">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-0 h-full">
          <div className="relative overflow-hidden rounded-xl border border-slate-200">
            <div className="pointer-events-none absolute inset-0 z-10 flex rotate-[-12deg] flex-wrap items-center justify-center gap-8 opacity-[0.05]">
              {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className="text-2xl font-bold text-slate-900">
                  数据预览 · 仅供查看
                </span>
              ))}
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500">
                <tr>
                  {Object.keys(resource.preview[0] || {}).map((key) => (
                    <th key={key} className="px-5 py-3 capitalize">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resource.preview.map((row, idx) => (
                  <tr key={idx} className="bg-white">
                    {Object.entries(row).map(([key, value]) => (
                      <td key={key} className="px-5 py-3 text-slate-600">
                        {String(value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
            <span>显示前 {resource.preview.length} 行样本</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                上一页
              </Button>
              <Button variant="outline" size="sm" disabled>
                下一页
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="quality" className="mt-0 h-full">
          <div className="grid grid-cols-2 gap-6 xl:grid-cols-4">
            <ScoreCard label="完整性" value={resource.quality.completeness} />
            <ScoreCard label="唯一性" value={resource.quality.uniqueness} />
            <ScoreCard label="一致性" value={resource.quality.consistency} />
            <ScoreCard label="及时性" value={resource.quality.timeliness} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-5">
              <h4 className="mb-4 text-sm font-semibold text-slate-700">字段空值率</h4>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resource.quality.nullRates}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="field" tick={{ fontSize: 11 }} interval={0} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => [`${v}%`, '空值率']} />
                    <Bar dataKey="rate" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 p-5">
              <h4 className="mb-4 text-sm font-semibold text-slate-700">枚举值分布</h4>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={resource.quality.enumDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {resource.quality.enumDistribution.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </TabsContent>
      </div>
    </Tabs>
  )
}

function StatCard({ label, value, unit, icon }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
        {icon}
        {label}
      </div>
      <p className="text-xl font-bold text-slate-800">
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-slate-500">{unit}</span>}
      </p>
    </div>
  )
}

function CodeBlock({ title, method, path, children }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-200 bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
        <div>
          <h4 className="text-sm font-semibold text-white">{title}</h4>
          {path && (
            <p className="mt-0.5 text-xs text-slate-400">
              {method} {path}
            </p>
          )}
          {!path && method && <p className="mt-0.5 text-xs text-slate-400">{method}</p>}
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1 rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? '已复制' : '复制'}
        </button>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-cyan-300">{children}</pre>
      </div>
    </div>
  )
}
