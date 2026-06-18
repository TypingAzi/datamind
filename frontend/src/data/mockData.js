export const nodeTypes = {
  flow: { label: '业务流程', color: '#0f172a', icon: 'GitBranch' },
  table: { label: '数据表', color: '#3b82f6', icon: 'Database' },
  metric: { label: '数据指标', color: '#22c55e', icon: 'BarChart3' },
  api: { label: 'API服务', color: '#a855f7', icon: 'Globe' },
  dataset: { label: '高质量数据集', color: '#eab308', icon: 'Layers', premium: true },
  field: { label: '字段', color: '#64748b', icon: 'AlignLeft' },
}

export const linkTypes = {
  flow: { label: '业务流转', color: '#64748b', dash: '', width: 3, arrow: true },
  belong: { label: '资源隶属', color: '#cbd5e1', dash: '4 4', width: 1.5, arrow: false },
  lineage: { label: '物理血缘', color: '#f97316', dash: '', width: 2, arrow: true },
  semantic: { label: '语义关联', color: '#8b5cf6', dash: '2 3', width: 1.5, arrow: false },
  contains: { label: '字段归属', color: '#94a3b8', dash: '2 2', width: 1, arrow: false },
}

export const graphData = {
  nodes: [
    // 流程节点
    { id: 'booking', label: '订舱', labelEn: 'Booking', type: 'flow', level: 1, icon: '⛴' },
    { id: 'container', label: '订箱', labelEn: 'Container', type: 'flow', level: 1, icon: '📦' },
    { id: 'declaration', label: '报关', labelEn: 'Declaration', type: 'flow', level: 1, icon: '📋' },
    { id: 'transport', label: '运输', labelEn: 'Transport', type: 'flow', level: 1, icon: '🚚' },
    { id: 'arrival', label: '到港', labelEn: 'Arrival', type: 'flow', level: 1, icon: '⚓' },

    // 数据资源节点
    { id: 't1', label: '订舱主表', type: 'table', parent: 'booking' },
    { id: 'm1', label: '订舱量', type: 'metric', parent: 'booking' },
    { id: 'a1', label: '订舱接口', type: 'api', parent: 'booking' },

    { id: 't2', label: '集装箱状态表', type: 'table', parent: 'container' },
    { id: 'm2', label: '箱周转率', type: 'metric', parent: 'container' },

    { id: 't3', label: '报关单表', type: 'table', parent: 'declaration' },
    { id: 'm3', label: '报关时效', type: 'metric', parent: 'declaration' },
    { id: 'd1', label: '报关脱敏集', type: 'dataset', parent: 'declaration' },
    { id: 'a2', label: '报关接口', type: 'api', parent: 'declaration' },

    { id: 't4', label: '在途跟踪表', type: 'table', parent: 'transport' },
    { id: 'm4', label: '准点率', type: 'metric', parent: 'transport' },

    { id: 't5', label: '到港通知表', type: 'table', parent: 'arrival' },
    { id: 'm5', label: '到港准点率', type: 'metric', parent: 'arrival' },
  ],
  links: [
    // 业务流转
    { source: 'booking', target: 'container', label: '生成订箱需求' },
    { source: 'container', target: 'declaration', label: '报关准备' },
    { source: 'declaration', target: 'transport', label: '放行运输' },
    { source: 'transport', target: 'arrival', label: '到港确认' },

    // 资源隶属
    { source: 'booking', target: 't1', type: 'belong' },
    { source: 'booking', target: 'm1', type: 'belong' },
    { source: 'booking', target: 'a1', type: 'belong' },
    { source: 'container', target: 't2', type: 'belong' },
    { source: 'container', target: 'm2', type: 'belong' },
    { source: 'declaration', target: 't3', type: 'belong' },
    { source: 'declaration', target: 'm3', type: 'belong' },
    { source: 'declaration', target: 'd1', type: 'belong' },
    { source: 'declaration', target: 'a2', type: 'belong' },
    { source: 'transport', target: 't4', type: 'belong' },
    { source: 'transport', target: 'm4', type: 'belong' },
    { source: 'arrival', target: 't5', type: 'belong' },
    { source: 'arrival', target: 'm5', type: 'belong' },
  ],
}

export const fieldGraphData = {
  fields: [
    // 订舱主表字段
    { id: 't1__booking_no', label: 'booking_no', labelCn: '订舱号', parent: 't1', type: 'field' },
    { id: 't1__cargo_owner', label: 'cargo_owner', labelCn: '货主名称', parent: 't1', type: 'field' },
    { id: 't1__container_qty', label: 'container_qty', labelCn: '箱量', parent: 't1', type: 'field' },
    { id: 't1__freight_amount', label: 'freight_amount', labelCn: '运费金额', parent: 't1', type: 'field' },
    { id: 't1__ship_date', label: 'ship_date', labelCn: '船期', parent: 't1', type: 'field' },

    // 集装箱状态表字段
    { id: 't2__container_no', label: 'container_no', labelCn: '集装箱号', parent: 't2', type: 'field' },
    { id: 't2__status', label: 'status', labelCn: '状态', parent: 't2', type: 'field' },
    { id: 't2__location', label: 'location', labelCn: '位置', parent: 't2', type: 'field' },

    // 报关单表字段
    { id: 't3__declaration_no', label: 'declaration_no', labelCn: '报关单号', parent: 't3', type: 'field' },
    { id: 't3__declare_date', label: 'declare_date', labelCn: '申报日期', parent: 't3', type: 'field' },
    { id: 't3__bill_of_lading_no', label: 'bill_of_lading_no', labelCn: '提运单号', parent: 't3', type: 'field' },
    { id: 't3__supervision_mode_cd', label: 'supervision_mode_cd', labelCn: '监管方式', parent: 't3', type: 'field' },
    { id: 't3__trade_country_cd', label: 'trade_country_cd', labelCn: '贸易国', parent: 't3', type: 'field' },
    { id: 't3__gross_weight', label: 'gross_weight', labelCn: '毛重', parent: 't3', type: 'field' },

    // 在途跟踪表字段
    { id: 't4__tracking_no', label: 'tracking_no', labelCn: '跟踪号', parent: 't4', type: 'field' },
    { id: 't4__current_location', label: 'current_location', labelCn: '当前位置', parent: 't4', type: 'field' },
    { id: 't4__eta', label: 'eta', labelCn: '预计到达', parent: 't4', type: 'field' },

    // 到港通知表字段
    { id: 't5__arrival_notice_no', label: 'arrival_notice_no', labelCn: '到港通知号', parent: 't5', type: 'field' },
    { id: 't5__actual_arrival_time', label: 'actual_arrival_time', labelCn: '实际到港时间', parent: 't5', type: 'field' },
    { id: 't5__terminal', label: 'terminal', labelCn: '码头', parent: 't5', type: 'field' },

    // 订舱量指标字段
    { id: 'm1__stat_date', label: 'stat_date', labelCn: '统计日期', parent: 'm1', type: 'field' },
    { id: 'm1__booking_count', label: 'booking_count', labelCn: '订舱笔数', parent: 'm1', type: 'field' },

    // 报关时效指标字段
    { id: 'm3__stat_date', label: 'stat_date', labelCn: '统计日期', parent: 'm3', type: 'field' },
    { id: 'm3__avg_duration_hours', label: 'avg_duration_hours', labelCn: '平均耗时', parent: 'm3', type: 'field' },

    // 到港准点率指标字段
    { id: 'm5__stat_date', label: 'stat_date', labelCn: '统计日期', parent: 'm5', type: 'field' },
    { id: 'm5__ontime_rate', label: 'ontime_rate', labelCn: '准点率', parent: 'm5', type: 'field' },

    // 港口作业数据集字段
    { id: 'd1__operation_id', label: 'operation_id', labelCn: '作业单号', parent: 'd1', type: 'field' },
    { id: 'd1__container_no', label: 'container_no', labelCn: '集装箱号', parent: 'd1', type: 'field' },
    { id: 'd1__operation_type', label: 'operation_type', labelCn: '作业类型', parent: 'd1', type: 'field' },

    // API 服务字段（端点抽象）
    { id: 'a1__get_booking', label: 'GET /booking/{id}', labelCn: '查询订舱', parent: 'a1', type: 'field' },
    { id: 'a1__post_booking', label: 'POST /booking', labelCn: '创建订舱', parent: 'a1', type: 'field' },
    { id: 'a2__get_status', label: 'GET /declaration/{id}/status', labelCn: '查询状态', parent: 'a2', type: 'field' },
    { id: 'a2__subscribe', label: 'POST /declaration/subscribe', labelCn: '订阅变更', parent: 'a2', type: 'field' },
  ],
  links: [
    // 物理血缘：表字段 -> 指标字段
    { source: 't1__container_qty', target: 'm1__booking_count', type: 'lineage', label: '聚合' },
    { source: 't1__ship_date', target: 'm1__stat_date', type: 'lineage', label: '映射' },
    { source: 't3__declaration_no', target: 'm3__avg_duration_hours', type: 'lineage', label: '计算' },
    { source: 't3__declare_date', target: 'm3__stat_date', type: 'lineage', label: '映射' },

    // 物理血缘：表字段 -> 数据集字段
    { source: 't2__container_no', target: 'd1__container_no', type: 'lineage', label: '同步' },

    // 物理血缘：到港准点率指标
    { source: 't4__eta', target: 'm5__stat_date', type: 'lineage', label: '映射' },
    { source: 't5__actual_arrival_time', target: 'm5__stat_date', type: 'lineage', label: '映射' },
    { source: 't4__eta', target: 'm5__ontime_rate', type: 'lineage', label: '计算' },
    { source: 't5__actual_arrival_time', target: 'm5__ontime_rate', type: 'lineage', label: '计算' },

    // 语义关联：跨业务对象字段
    { source: 't1__booking_no', target: 't3__bill_of_lading_no', type: 'semantic', label: '同单关联' },
    { source: 't3__bill_of_lading_no', target: 't4__tracking_no', type: 'semantic', label: '运单关联' },
    { source: 't4__eta', target: 't5__actual_arrival_time', type: 'semantic', label: '时间关联' },
    { source: 'a1__get_booking', target: 't1__booking_no', type: 'semantic', label: '入参关联' },
    { source: 'a2__get_status', target: 't3__declaration_no', type: 'semantic', label: '入参关联' },

    // 语义血缘：业务时间线
    { source: 't1__ship_date', target: 't4__eta', type: 'semantic', label: '船期-预计到港' },
    { source: 't4__eta', target: 't5__actual_arrival_time', type: 'semantic', label: '预计-实际到港' },

    // 语义血缘：物流跟踪
    { source: 't2__container_no', target: 't4__tracking_no', type: 'semantic', label: '箱号-跟踪号' },

    // 语义血缘：业务单据链
    { source: 't1__booking_no', target: 't5__arrival_notice_no', type: 'semantic', label: '订舱-到港通知' },
    { source: 't3__bill_of_lading_no', target: 't5__arrival_notice_no', type: 'semantic', label: '提单-到港通知' },
  ],
}

export const mockSearchResults = [
  {
    id: 't1',
    name: '订舱主表',
    type: 'table',
    owner: '张三',
    updatedAt: '2026-06-10',
    description: '记录海运订舱的核心业务数据，包含船期、箱量、货主等关键字段。',
    businessDomain: '航贸监管',
    flowNode: '订舱',
    securityLevel: 'L2敏感',
    healthScore: 98,
    engine: 'StarRocks',
    totalRows: 12500000,
    storageSize: '2.4 GB',
    updateFrequency: 'T+1',
    schema: [
      { field: 'booking_no', type: 'VARCHAR(32)', comment: '订舱号', sensitive: false, dict: 'ODS.booking_source.booking_no' },
      { field: 'cargo_owner', type: 'VARCHAR(128)', comment: '货主名称', sensitive: true, dict: 'ODS.booking_source.cargo_owner' },
      { field: 'container_qty', type: 'INT', comment: '箱量', sensitive: false, dict: 'ODS.booking_source.container_qty' },
      { field: 'freight_amount', type: 'DECIMAL(18,2)', comment: '运费金额', sensitive: true, dict: 'ODS.booking_source.freight_amount' },
      { field: 'ship_date', type: 'DATE', comment: '船期', sensitive: false, dict: 'ODS.booking_source.ship_date' },
    ],
    preview: [
      { booking_no: 'BK2026001', cargo_owner: '***', container_qty: 2, freight_amount: '***', ship_date: '2026-06-15' },
      { booking_no: 'BK2026002', cargo_owner: '***', container_qty: 5, freight_amount: '***', ship_date: '2026-06-16' },
      { booking_no: 'BK2026003', cargo_owner: '***', container_qty: 1, freight_amount: '***', ship_date: '2026-06-17' },
    ],
    quality: {
      completeness: 99.2,
      uniqueness: 98.5,
      consistency: 97.8,
      timeliness: 99.5,
      nullRates: [
        { field: 'booking_no', rate: 0.01 },
        { field: 'cargo_owner', rate: 0.05 },
        { field: 'container_qty', rate: 0.02 },
        { field: 'freight_amount', rate: 0.03 },
        { field: 'ship_date', rate: 0.01 },
      ],
      enumDistribution: [
        { name: '已订舱', value: 45 },
        { name: '已放行', value: 30 },
        { name: '运输中', value: 18 },
        { name: '已到达', value: 7 },
      ],
    },
  },
  {
    id: 'm1',
    name: '订舱量',
    type: 'metric',
    owner: '李四',
    updatedAt: '2026-06-11',
    description: '按日/周/月统计的订舱数量指标。',
    businessDomain: '航贸监管',
    flowNode: '订舱',
    securityLevel: 'L1公开',
    healthScore: 96,
    engine: 'Doris',
    totalRows: 3650,
    storageSize: '12 MB',
    updateFrequency: '实时',
    schema: [
      { field: 'stat_date', type: 'DATE', comment: '统计日期', sensitive: false, dict: 'DWS.metric_booking_daily.stat_date' },
      { field: 'booking_count', type: 'INT', comment: '订舱笔数', sensitive: false, dict: 'DWS.metric_booking_daily.booking_count' },
    ],
    preview: [
      { stat_date: '2026-06-01', booking_count: 128 },
      { stat_date: '2026-06-02', booking_count: 135 },
      { stat_date: '2026-06-03', booking_count: 142 },
    ],
    quality: {
      completeness: 98.5,
      uniqueness: 100,
      consistency: 99.2,
      timeliness: 100,
      nullRates: [
        { field: 'stat_date', rate: 0 },
        { field: 'booking_count', rate: 0 },
      ],
      enumDistribution: [
        { name: '日报', value: 70 },
        { name: '周报', value: 20 },
        { name: '月报', value: 10 },
      ],
    },
    metricDetail: {
      formula: 'COUNT(DISTINCT booking_no) WHERE ship_date = ${stat_date}',
      formulaPlain: '当日去重订舱单号数量',
      dimensions: [
        { name: 'stat_date', comment: '统计日期', cardinality: 3650 },
        { name: 'cargo_owner', comment: '货主', cardinality: 1200 },
        { name: 'destination_port', comment: '目的港', cardinality: 86 },
      ],
      granularity: '日/周/月',
      unit: '笔',
      updateTrigger: 'T+1 离线调度 + 实时增量',
      metricLineage: [
        { layer: 'ODS', table: 'booking_source', fields: ['booking_no', 'ship_date', 'cargo_owner'] },
        { layer: 'DWD', table: 'dwd_booking_detail', fields: ['booking_no', 'stat_date', 'cargo_owner_id'] },
        { layer: 'DWS', table: 'metric_booking_daily', fields: ['stat_date', 'booking_count'] },
        { layer: 'ADS', table: 'ads_booking_dashboard', fields: ['stat_date', 'booking_count'] },
      ],
      trend: [
        { date: '2026-06-08', value: 118 },
        { date: '2026-06-09', value: 125 },
        { date: '2026-06-10', value: 132 },
        { date: '2026-06-11', value: 128 },
        { date: '2026-06-12', value: 135 },
        { date: '2026-06-13', value: 142 },
        { date: '2026-06-14', value: 138 },
      ],
    },
  },
  {
    id: 'a1',
    name: '订舱接口',
    type: 'api',
    owner: '王五',
    updatedAt: '2026-06-09',
    description: '提供订舱信息查询与下发的 RESTful API。',
    businessDomain: '航贸监管',
    flowNode: '订舱',
    securityLevel: 'L2敏感',
    healthScore: 99,
    engine: 'Spring Cloud Gateway',
    totalRows: null,
    storageSize: '-',
    updateFrequency: '实时',
    schema: [
      { field: 'GET /booking/{id}', type: 'API', comment: '查询订舱详情', sensitive: false, dict: 'BFF -> Booking Service' },
      { field: 'POST /booking', type: 'API', comment: '创建订舱', sensitive: false, dict: 'BFF -> Booking Service' },
    ],
    preview: [
      { endpoint: 'GET /booking/BK2026001', status: '200 OK' },
      { endpoint: 'POST /booking', status: '201 Created' },
      { endpoint: 'PUT /booking/BK2026001', status: '200 OK' },
    ],
    quality: {
      completeness: 100,
      uniqueness: 100,
      consistency: 100,
      timeliness: 99.8,
      nullRates: [
        { field: 'GET /booking/{id}', rate: 0 },
        { field: 'POST /booking', rate: 0 },
      ],
      enumDistribution: [
        { name: '2xx', value: 98 },
        { name: '4xx', value: 1.5 },
        { name: '5xx', value: 0.5 },
      ],
    },
    apiDetail: {
      baseUrl: 'https://api.etoc-portal.com/v1',
      version: 'v1.2.0',
      qps: 1200,
      avgLatencyMs: 45,
      p99LatencyMs: 128,
      statusDistribution: [
        { name: '2xx', value: 98 },
        { name: '4xx', value: 1.5 },
        { name: '5xx', value: 0.5 },
      ],
      endpoints: [
        {
          method: 'GET',
          path: '/booking/{id}',
          summary: '查询订舱详情',
          qps: 800,
          p99Ms: 38,
          description: '根据订舱号查询订舱主表详情，返回船期、箱量、货主等核心字段。',
        },
        {
          method: 'POST',
          path: '/booking',
          summary: '创建订舱',
          qps: 300,
          p99Ms: 95,
          description: '接收订舱请求并写入订舱主表，支持同步返回预分配订舱号。',
        },
        {
          method: 'PUT',
          path: '/booking/{id}',
          summary: '更新订舱',
          qps: 100,
          p99Ms: 72,
          description: '更新指定订舱号的船期、箱量、运费等字段。',
        },
      ],
      requestExample: {
        method: 'POST',
        path: '/booking',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': 'req_202606150001',
        },
        body: JSON.stringify(
          {
            cargoOwner: '上海亿通国际物流有限公司',
            containerQty: 3,
            freightAmount: 12500.0,
            shipDate: '2026-06-20',
            destinationPort: '洛杉矶',
          },
          null,
          2
        ),
      },
      responseExample: {
        status: 201,
        body: JSON.stringify(
          {
            bookingNo: 'BK2026150',
            status: 'CREATED',
            shipDate: '2026-06-20',
            containerQty: 3,
          },
          null,
          2
        ),
      },
    },
  },
  {
    id: 't2',
    name: '进口报关单主表',
    type: 'table',
    owner: '赵六',
    updatedAt: '2026-06-12',
    description: '海关进口报关单核心主数据，包含报关单号、申报地海关、收发货人、运输方式、监管方式、贸易国及毛重等关键字段。',
    businessDomain: '通关物流',
    flowNode: '报关申报',
    securityLevel: 'L3机密',
    healthScore: 94,
    engine: 'Apache Doris',
    totalRows: 8600000,
    storageSize: '1.8 GB',
    updateFrequency: 'T+1',
    schema: [
      { field: 'declaration_no', type: 'VARCHAR(18)', comment: '报关单号(海关编号)', sensitive: false, dict: '唯一主键 / 必填' },
      { field: 'pre_entry_no', type: 'VARCHAR(18)', comment: '预录入编号', sensitive: false, dict: '必填' },
      { field: 'declare_customs_code', type: 'VARCHAR(4)', comment: '申报地海关代码', sensitive: false, dict: 'dict_customs_port' },
      { field: 'declare_date', type: 'DATE', comment: '申报日期', sensitive: false, dict: '必填' },
      { field: 'consignee_scc', type: 'VARCHAR(18)', comment: '境内收发货人信用代码', sensitive: true, dict: '必填' },
      { field: 'transport_mode_cd', type: 'VARCHAR(2)', comment: '运输方式代码', sensitive: false, dict: 'dict_traf_mode' },
      { field: 'bill_of_lading_no', type: 'VARCHAR(32)', comment: '提运单号', sensitive: true, dict: '必填' },
      { field: 'supervision_mode_cd', type: 'VARCHAR(4)', comment: '监管方式代码', sensitive: false, dict: 'dict_supv_mode' },
      { field: 'trade_country_cd', type: 'VARCHAR(3)', comment: '贸易国(地区)代码', sensitive: false, dict: 'dict_country' },
      { field: 'gross_weight', type: 'DECIMAL(18,4)', comment: '毛重(千克)', sensitive: false, dict: '非必填' },
    ],
    preview: [
      { declaration_no: 'DEC2026001', hs_code: '8471.30', declare_amount: '***' },
      { declaration_no: 'DEC2026002', hs_code: '8528.72', declare_amount: '***' },
    ],
    quality: {
      completeness: 97.5,
      uniqueness: 99.1,
      consistency: 96.8,
      timeliness: 98.2,
      nullRates: [
        { field: 'declaration_no', rate: 0 },
        { field: 'hs_code', rate: 0.02 },
        { field: 'declare_amount', rate: 0.05 },
      ],
      enumDistribution: [
        { name: '已申报', value: 55 },
        { name: '查验中', value: 25 },
        { name: '已放行', value: 20 },
      ],
    },
  },
  {
    id: 'm2',
    name: '报关时效',
    type: 'metric',
    owner: '孙七',
    updatedAt: '2026-06-12',
    description: '统计报关单从申报到放行的平均耗时指标。',
    businessDomain: '通关物流',
    flowNode: '报关',
    securityLevel: 'L1公开',
    healthScore: 97,
    engine: 'StarRocks',
    totalRows: 1800,
    storageSize: '8 MB',
    updateFrequency: 'T+1',
    schema: [
      { field: 'stat_date', type: 'DATE', comment: '统计日期', sensitive: false, dict: 'DWS.metric_declaration_duration.stat_date' },
      { field: 'avg_duration_hours', type: 'DECIMAL(8,2)', comment: '平均耗时(小时)', sensitive: false, dict: 'DWS.metric_declaration_duration.avg_duration_hours' },
    ],
    preview: [
      { stat_date: '2026-06-10', avg_duration_hours: 4.5 },
      { stat_date: '2026-06-11', avg_duration_hours: 3.8 },
    ],
    quality: {
      completeness: 99,
      uniqueness: 100,
      consistency: 98.5,
      timeliness: 99,
      nullRates: [
        { field: 'stat_date', rate: 0 },
        { field: 'avg_duration_hours', rate: 0.01 },
      ],
      enumDistribution: [
        { name: '< 4h', value: 45 },
        { name: '4-8h', value: 35 },
        { name: '> 8h', value: 20 },
      ],
    },
    metricDetail: {
      formula: 'AVG(released_time - declared_time) WHERE stat_date = ${stat_date}',
      formulaPlain: '当日放行时间与申报时间差值的平均小时数',
      dimensions: [
        { name: 'stat_date', comment: '统计日期', cardinality: 1800 },
        { name: 'declare_customs_code', comment: '申报地海关', cardinality: 42 },
        { name: 'supervision_mode_cd', comment: '监管方式', cardinality: 18 },
      ],
      granularity: '日/周/月',
      unit: '小时',
      updateTrigger: 'T+1 离线调度',
      metricLineage: [
        { layer: 'ODS', table: 'declaration_master', fields: ['declaration_no', 'declare_date', 'released_time'] },
        { layer: 'DWD', table: 'dwd_declaration_event', fields: ['declaration_no', 'declared_time', 'released_time'] },
        { layer: 'DWS', table: 'metric_declaration_duration', fields: ['stat_date', 'avg_duration_hours'] },
        { layer: 'ADS', table: 'ads_customs_dashboard', fields: ['stat_date', 'avg_duration_hours'] },
      ],
      trend: [
        { date: '2026-06-08', value: 4.2 },
        { date: '2026-06-09', value: 3.9 },
        { date: '2026-06-10', value: 4.5 },
        { date: '2026-06-11', value: 3.8 },
        { date: '2026-06-12', value: 4.1 },
        { date: '2026-06-13', value: 3.6 },
        { date: '2026-06-14', value: 3.7 },
      ],
    },
  },
  {
    id: 'a2',
    name: '报关状态查询接口',
    type: 'api',
    owner: '周八',
    updatedAt: '2026-06-11',
    description: '提供报关单状态实时查询与订阅通知的 API 服务。',
    businessDomain: '通关物流',
    flowNode: '报关',
    securityLevel: 'L2敏感',
    healthScore: 99,
    engine: 'Spring Cloud Gateway',
    totalRows: null,
    storageSize: '-',
    updateFrequency: '实时',
    schema: [
      { field: 'GET /declaration/{id}/status', type: 'API', comment: '查询报关状态', sensitive: false, dict: 'BFF -> Customs Service' },
      { field: 'POST /declaration/subscribe', type: 'API', comment: '订阅状态变更', sensitive: false, dict: 'BFF -> Customs Service' },
    ],
    preview: [
      { endpoint: 'GET /declaration/DEC2026001/status', status: '200 OK' },
      { endpoint: 'POST /declaration/subscribe', status: '201 Created' },
    ],
    quality: {
      completeness: 100,
      uniqueness: 100,
      consistency: 100,
      timeliness: 99.9,
      nullRates: [
        { field: 'GET /declaration/{id}/status', rate: 0 },
        { field: 'POST /declaration/subscribe', rate: 0 },
      ],
      enumDistribution: [
        { name: '2xx', value: 99 },
        { name: '4xx', value: 0.8 },
        { name: '5xx', value: 0.2 },
      ],
    },
    apiDetail: {
      baseUrl: 'https://api.etoc-portal.com/v1',
      version: 'v2.0.1',
      qps: 2500,
      avgLatencyMs: 32,
      p99LatencyMs: 86,
      statusDistribution: [
        { name: '2xx', value: 99 },
        { name: '4xx', value: 0.8 },
        { name: '5xx', value: 0.2 },
      ],
      endpoints: [
        {
          method: 'GET',
          path: '/declaration/{id}/status',
          summary: '查询报关状态',
          qps: 1800,
          p99Ms: 28,
          description: '根据报关单号返回当前状态（已申报/查验中/已放行等）。',
        },
        {
          method: 'POST',
          path: '/declaration/subscribe',
          summary: '订阅状态变更',
          qps: 700,
          p99Ms: 55,
          description: '订阅指定报关单的状态变更推送。',
        },
      ],
      requestExample: {
        method: 'POST',
        path: '/declaration/subscribe',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': 'req_202606150002',
        },
        body: JSON.stringify(
          {
            declarationNo: 'DEC2026001',
            callbackUrl: 'https://partner.example.com/cb/status',
            events: ['RELEASED', 'INSPECTED'],
          },
          null,
          2
        ),
      },
      responseExample: {
        status: 200,
        body: JSON.stringify(
          {
            declarationNo: 'DEC2026001',
            status: 'RELEASED',
            statusTime: '2026-06-15T09:30:00Z',
            customsOffice: '浦东机场海关',
          },
          null,
          2
        ),
      },
    },
  },
  {
    id: 'd1',
    name: '港口作业脱敏数据集',
    type: 'dataset',
    owner: '吴九',
    updatedAt: '2026-06-10',
    description: '港口装卸、堆存、闸口作业等脱敏后的高质量数据集。',
    businessDomain: '港口运营',
    flowNode: '到港',
    securityLevel: 'L2敏感',
    healthScore: 96,
    engine: 'Hudi on OSS',
    totalRows: 56000000,
    storageSize: '18 GB',
    updateFrequency: 'T+1',
    schema: [
      { field: 'operation_id', type: 'VARCHAR(32)', comment: '作业单号', sensitive: false, dict: 'ODS.port_operation.operation_id' },
      { field: 'container_no', type: 'VARCHAR(16)', comment: '集装箱号', sensitive: true, dict: 'ODS.port_operation.container_no' },
      { field: 'operation_type', type: 'VARCHAR(32)', comment: '作业类型', sensitive: false, dict: 'ODS.port_operation.operation_type' },
    ],
    preview: [
      { operation_id: 'OP2026001', container_no: '***', operation_type: '卸船' },
      { operation_id: 'OP2026002', container_no: '***', operation_type: '提箱' },
    ],
    quality: {
      completeness: 98.8,
      uniqueness: 97.5,
      consistency: 99.1,
      timeliness: 98,
      nullRates: [
        { field: 'operation_id', rate: 0 },
        { field: 'container_no', rate: 0.03 },
        { field: 'operation_type', rate: 0.01 },
      ],
      enumDistribution: [
        { name: '卸船', value: 40 },
        { name: '装船', value: 30 },
        { name: '提箱', value: 20 },
        { name: '进箱', value: 10 },
      ],
    },
    datasetDetail: {
      accessMethod: 'API 订阅 / OSS 离线下载 / 自助分析工作台引用',
      updatePolicy: 'T+1 增量更新，保留 36 个月历史分区',
      license: 'L2 敏感数据，需签署使用协议并审批',
      qualityTags: ['已脱敏', '主键完整', '时间戳规范', '字典对齐'],
      usageScenarios: ['港口效能分析', '闸口拥堵预测', '船舶在港时长建模'],
      sampleFiles: [
        { name: 'port_operation_20260614.parquet', size: '420 MB', rows: 1200000 },
        { name: 'port_operation_20260613.parquet', size: '398 MB', rows: 1150000 },
      ],
      relatedAssets: [
        { id: 't2', name: '集装箱状态表', relation: '来源表' },
        { id: 'm3', name: '船舶准点率', relation: '下游指标' },
      ],
    },
  },
  {
    id: 'm3',
    name: '船舶准点率',
    type: 'metric',
    owner: '郑十',
    updatedAt: '2026-06-09',
    description: '按航线统计船舶预计到港与实际到港的准点率指标。',
    businessDomain: '航运调度',
    flowNode: '到港',
    securityLevel: 'L1公开',
    healthScore: 95,
    engine: 'Doris',
    totalRows: 2400,
    storageSize: '10 MB',
    updateFrequency: 'T+1',
    schema: [
      { field: 'stat_date', type: 'DATE', comment: '统计日期', sensitive: false, dict: 'DWS.metric_vessel_ontime.stat_date' },
      { field: 'route_code', type: 'VARCHAR(16)', comment: '航线编码', sensitive: false, dict: 'DWS.metric_vessel_ontime.route_code' },
      { field: 'ontime_rate', type: 'DECIMAL(5,2)', comment: '准点率(%)', sensitive: false, dict: 'DWS.metric_vessel_ontime.ontime_rate' },
    ],
    preview: [
      { stat_date: '2026-06-08', route_code: 'EA1', ontime_rate: 92.5 },
      { stat_date: '2026-06-09', route_code: 'EA2', ontime_rate: 88.3 },
    ],
    quality: {
      completeness: 98,
      uniqueness: 100,
      consistency: 97,
      timeliness: 99,
      nullRates: [
        { field: 'stat_date', rate: 0 },
        { field: 'route_code', rate: 0 },
        { field: 'ontime_rate', rate: 0.02 },
      ],
      enumDistribution: [
        { name: '> 90%', value: 60 },
        { name: '80-90%', value: 30 },
        { name: '< 80%', value: 10 },
      ],
    },
    metricDetail: {
      formula: 'SUM(ontime_vessel_count) / SUM(total_vessel_count) * 100',
      formulaPlain: '准点船舶数 / 总到港船舶数 × 100%',
      dimensions: [
        { name: 'stat_date', comment: '统计日期', cardinality: 2400 },
        { name: 'route_code', comment: '航线编码', cardinality: 42 },
        { name: 'carrier_code', comment: '船公司代码', cardinality: 18 },
      ],
      granularity: '日/周/月',
      unit: '%',
      updateTrigger: 'T+1 离线调度',
      metricLineage: [
        { layer: 'ODS', table: 'vessel_schedule', fields: ['vessel_id', 'eta', 'route_code'] },
        { layer: 'ODS', table: 'arrival_notice', fields: ['vessel_id', 'actual_arrival_time'] },
        { layer: 'DWD', table: 'dwd_vessel_ontime', fields: ['stat_date', 'route_code', 'ontime_flag'] },
        { layer: 'DWS', table: 'metric_vessel_ontime', fields: ['stat_date', 'route_code', 'ontime_rate'] },
      ],
      trend: [
        { date: '2026-06-08', value: 92.5 },
        { date: '2026-06-09', value: 88.3 },
        { date: '2026-06-10', value: 90.1 },
        { date: '2026-06-11', value: 91.4 },
        { date: '2026-06-12', value: 93.2 },
        { date: '2026-06-13', value: 89.7 },
        { date: '2026-06-14', value: 91.8 },
      ],
    },
  },
]

export function getResourceById(id) {
  return mockSearchResults.find((item) => item.id === id)
}

export function searchResources(keyword) {
  if (!keyword) return []
  return mockSearchResults.filter((item) =>
    item.name.toLowerCase().includes(keyword.toLowerCase())
  )
}
