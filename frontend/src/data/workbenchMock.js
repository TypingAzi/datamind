export const schemaTree = {
  name: '数据目录',
  type: 'root',
  children: [
    {
      name: '公共数据',
      type: 'section',
      sectionType: 'public',
      children: [
        {
          name: '进口报关单主表',
          tableName: 't_import_declaration',
          type: 'table',
          comment: '海关进口报关单核心主数据',
          children: [
            { name: '报关单号', type: 'field', dataType: 'VARCHAR(18)', comment: '报关单号(海关编号)', englishName: 'declaration_no' },
            { name: '预录入编号', type: 'field', dataType: 'VARCHAR(18)', comment: '预录入编号', englishName: 'pre_entry_no' },
            { name: '申报地海关', type: 'field', dataType: 'VARCHAR(4)', comment: '申报地海关代码', englishName: 'declare_customs_code' },
            { name: '申报日期', type: 'field', dataType: 'DATE', comment: '申报日期', englishName: 'declare_date' },
            { name: '境内收发货人信用代码', type: 'field', dataType: 'VARCHAR(18)', comment: '境内收发货人信用代码', englishName: 'consignee_scc' },
            { name: '运输方式代码', type: 'field', dataType: 'VARCHAR(2)', comment: '运输方式代码', englishName: 'transport_mode_cd' },
            { name: '提运单号', type: 'field', dataType: 'VARCHAR(32)', comment: '提运单号', englishName: 'bill_of_lading_no' },
            { name: '监管方式代码', type: 'field', dataType: 'VARCHAR(4)', comment: '监管方式代码', englishName: 'supervision_mode_cd' },
            { name: '贸易国代码', type: 'field', dataType: 'VARCHAR(3)', comment: '贸易国(地区)代码', englishName: 'trade_country_cd' },
            { name: '毛重', type: 'field', dataType: 'Decimal(18,4)', comment: '毛重(千克)', englishName: 'gross_weight' },
          ],
        },
      ],
    },
    {
      name: '维度数据',
      type: 'section',
      sectionType: 'dimensional',
      children: [
        {
          name: '报关单国别维度表',
          tableName: 'dim_country',
          type: 'table',
          comment: '贸易国别/地区维度字典',
          children: [
            { name: '中国', type: 'field', dataType: 'VARCHAR(3)', comment: '中国', enumValues: 'CN' },
            { name: '美国', type: 'field', dataType: 'VARCHAR(3)', comment: '美国', enumValues: 'US' },
            { name: '日本', type: 'field', dataType: 'VARCHAR(3)', comment: '日本', enumValues: 'JP' },
            { name: '韩国', type: 'field', dataType: 'VARCHAR(3)', comment: '韩国', enumValues: 'KR' },
            { name: '德国', type: 'field', dataType: 'VARCHAR(3)', comment: '德国', enumValues: 'DE' },
          ],
        },
      ],
    },
    {
      name: '自助开发数据',
      type: 'section',
      sectionType: 'self-service',
      children: [],
    },
  ],
}

export const resultColumns = [
  'declaration_no',
  'declare_customs_code',
  'gross_weight',
  'create_time',
]

export const resultRows = [
  { declaration_no: 'DEC-***-001', declare_customs_code: '0708', gross_weight: '***', create_time: '2026-05-12 08:23:14' },
  { declaration_no: 'DEC-***-002', declare_customs_code: '0701', gross_weight: '***', create_time: '2026-05-12 09:15:33' },
  { declaration_no: 'DEC-***-003', declare_customs_code: '2200', gross_weight: '***', create_time: '2026-05-12 10:41:57' },
  { declaration_no: 'DEC-***-004', declare_customs_code: '0100', gross_weight: '***', create_time: '2026-05-12 11:08:22' },
  { declaration_no: 'DEC-***-005', declare_customs_code: '0708', gross_weight: '***', create_time: '2026-05-12 13:55:09' },
]

export const executionMeta = {
  queryTime: '2026-06-11 10:05:00',
  executionTime: '2.1s',
  scannedRows: '10,000,000',
}

export const chatScenario = {
  userQuestion: '帮我查一下上月已放行的进口报关单，按申报地海关分组统计平均毛重。',
  generatedSql: `-- ChatBI 生成 SQL
-- 口径：上月已放行进口报关单，按申报地海关分组统计平均毛重
SELECT
  declare_customs_code,
  AVG(gross_weight) AS avg_gross_weight,
  COUNT(*) AS declaration_count
FROM public_db.t_import_declaration
WHERE clearance_status = 'released'
  AND MONTH(declare_date) = MONTH(CURRENT_DATE) - 1
GROUP BY declare_customs_code
ORDER BY avg_gross_weight DESC;`,
  explanation: '已为您筛选上月已放行进口报关单，按申报地海关分组计算平均毛重，并按平均毛重降序排列。',
}
