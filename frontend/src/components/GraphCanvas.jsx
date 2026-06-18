import { useEffect, useRef, useState, useImperativeHandle, forwardRef, useMemo } from 'react'
import * as d3 from 'd3'
import { graphData, fieldGraphData, nodeTypes, linkTypes, getResourceById } from '@/data/mockData'
import { useAppStore } from '@/stores/appStore'

export const GraphCanvas = forwardRef(function GraphCanvas(_, ref) {
  const containerRef = useRef(null)
  const svgRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const {
    setSelectedResource,
    hoveredNode,
    setHoveredNode,
    graphLevel,
    graphVisibility,
    graphLinkVisibility,
    expandedNodes,
    toggleExpandedNode,
    selectedNodeId,
    setSelectedNodeId,
  } = useAppStore()

  const simulationRef = useRef(null)
  const nodesRef = useRef([])
  const linksRef = useRef([])
  const nodeSelRef = useRef(null)
  const linkSelRef = useRef(null)
  const linkCardSelRef = useRef(null)
  const leaderSelRef = useRef(null)
  const nodeLabelSelRef = useRef(null)
  const zoomRef = useRef(null)
  const transformRef = useRef(d3.zoomIdentity)
  const positionsRef = useRef({})
  const clickTimerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return
    const updateSize = () => {
      const { width, height } = containerRef.current.getBoundingClientRect()
      setDimensions({ width, height })
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  const buildGraphData = useMemo(() => {
    return () => {
      const baseNodes = graphData.nodes.map((n) => ({ ...n }))
      const baseLinks = graphData.links.map((l) => ({ ...l }))

      let nodes
      let links
      if (graphLevel === 'L1') {
        nodes = baseNodes.filter((n) => n.type === 'flow')
        links = baseLinks.filter((l) => l.type === 'flow' || !l.type)
      } else {
        nodes = [...baseNodes]
        links = [...baseLinks]
      }

      nodes = nodes.filter((n) => graphVisibility[n.type] !== false)

      if (graphLevel === 'L3') {
        const visibleNodeIds = new Set(nodes.map((n) => n.id))
        const expandedFieldNodes = fieldGraphData.fields
          .filter((f) => expandedNodes.has(f.parent) && visibleNodeIds.has(f.parent))
          .map((f) => ({ ...f }))
        nodes = nodes.concat(expandedFieldNodes)

        const containsLinks = expandedFieldNodes.map((f) => ({
          source: f.parent,
          target: f.id,
          type: 'contains',
        }))
        links = links.concat(containsLinks)

        const nodeIds = new Set(nodes.map((n) => n.id))
        const extraLinks = fieldGraphData.links
          .filter((l) => nodeIds.has(l.source) && nodeIds.has(l.target))
          .map((l) => ({ ...l }))
        links = links.concat(extraLinks)
      }

      links = links.filter((l) => graphLinkVisibility[l.type || 'flow'] !== false)

      // 过滤掉源/目标节点已被隐藏的孤儿连线，避免 D3 报 "node not found"
      const finalNodeIds = new Set(nodes.map((n) => n.id))
      links = links.filter((l) => finalNodeIds.has(l.source) && finalNodeIds.has(l.target))

      return { nodes, links }
    }
  }, [graphLevel, graphVisibility, graphLinkVisibility, expandedNodes])

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return

    // 保留上一轮节点的位置，避免重绘时整图跳动
    const prevPositions = {}
    nodesRef.current.forEach((n) => {
      if (n.x != null && n.y != null) prevPositions[n.id] = { x: n.x, y: n.y }
    })
    positionsRef.current = prevPositions
    const hasPrevPositions = Object.keys(prevPositions).length > 0

    const { nodes, links } = buildGraphData()

    // 初始化位置：旧节点保持原位，新字段节点按父节点均匀分布，避免重叠
    const fieldIndexByParent = {}
    const fieldCountByParent = {}
    nodes.forEach((n) => {
      if (n.type === 'field' && !prevPositions[n.id]) {
        fieldCountByParent[n.parent] = (fieldCountByParent[n.parent] || 0) + 1
      }
    })
    nodes.forEach((n) => {
      if (prevPositions[n.id]) {
        n.x = prevPositions[n.id].x
        n.y = prevPositions[n.id].y
        n.vx = 0
        n.vy = 0
      } else if (n.type === 'field') {
        const parent = nodes.find((p) => p.id === n.parent)
        if (parent && parent.x != null) {
          const idx = fieldIndexByParent[n.parent] || 0
          fieldIndexByParent[n.parent] = idx + 1
          const siblings = fieldCountByParent[n.parent] || 1
          const angle = (idx / siblings) * Math.PI * 2 - Math.PI / 2
          const dist = 90
          n.x = parent.x + Math.cos(angle) * dist
          n.y = parent.y + Math.sin(angle) * dist
        }
      }
    })

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const { width, height } = dimensions
    const g = svg.append('g')

    const zoom = d3
      .zoom()
      .scaleExtent([0.2, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
        transformRef.current = event.transform
        updateVisualPositions()
      })
    svg.call(zoom)
    zoomRef.current = zoom

    nodesRef.current = nodes
    linksRef.current = links

    const forceLink = d3
      .forceLink(links)
      .id((d) => d.id)
      .distance((d) => {
        if (d.type === 'contains') return 100
        if (d.type === 'belong') return 90
        if (d.type === 'lineage' || d.type === 'semantic') return 120
        return 180
      })

    const forceCharge = d3.forceManyBody().strength((d) => {
      if (d.type === 'flow') return -1200
      if (d.type === 'field') return -50
      return -500
    })

    const forceCollide = d3.forceCollide().radius((d) => {
      if (d.type === 'flow') return 64
      if (d.type === 'field') return 14
      return d.type === 'dataset' ? 30 : 26
    })

    const simulation = d3
      .forceSimulation(nodes)
      .force('link', forceLink)
      .force('charge', forceCharge)
      .force('center', d3.forceCenter(0, 0))
      .force('collide', forceCollide)
      .force(
        'x',
        d3
          .forceX()
          .strength((d) => (d.type === 'field' ? 0 : 0.02))
          .x((d) => (d.type === 'field' ? 0 : d.x || 0))
      )
      .force(
        'y',
        d3
          .forceY()
          .strength((d) => (d.type === 'field' ? 0 : 0.02))
          .y((d) => (d.type === 'field' ? 0 : d.y || 0))
      )
    if (hasPrevPositions) simulation.alpha(0.25)
    simulationRef.current = simulation

    const defs = g.append('defs')
    ;[
      { id: 'arrow-flow', color: linkTypes.flow.color },
      { id: 'arrow-lineage', color: linkTypes.lineage.color },
    ].forEach((m) => {
      defs
        .append('marker')
        .attr('id', m.id)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 38)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', m.color)
    })

    // 连线层
    const linkGroup = g.append('g').attr('class', 'links')
    const link = linkGroup
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d) => linkTypes[d.type || 'flow']?.color || '#94a3b8')
      .attr('stroke-width', (d) => linkTypes[d.type || 'flow']?.width || 2)
      .attr('stroke-dasharray', (d) => linkTypes[d.type || 'flow']?.dash || '0')
      .attr('marker-end', (d) => {
        const t = d.type || 'flow'
        if (t === 'flow') return 'url(#arrow-flow)'
        if (t === 'lineage') return 'url(#arrow-lineage)'
        return null
      })
    linkSelRef.current = link

    // 连线中点浮动卡片层（确保在连线之上）
    const linkCardGroup = g.append('g').attr('class', 'link-cards')
    const linkCard = linkCardGroup
      .selectAll('g.link-card')
      .data(links.filter((l) => l.label))
      .enter()
      .append('g')
      .attr('class', 'link-card')
      .style('pointer-events', 'none')

    linkCard.each(function (d) {
      const el = d3.select(this)
      const paddingX = 4
      const width = Math.max(28, d.label.length * 11 + paddingX * 2)
      const height = 14
      el.append('rect')
        .attr('x', -width / 2)
        .attr('y', -height / 2)
        .attr('width', width)
        .attr('height', height)
        .attr('rx', 2)
        .attr('fill', '#ffffff')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1)
      el.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', '#1f2937')
        .attr('font-size', 11)
        .attr('class', 'select-none')
        .text(d.label)
    })
    linkCardSelRef.current = linkCard

    // 节点层
    const nodeGroup = g.append('g').attr('class', 'nodes')
    const node = nodeGroup
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g')
      .style('cursor', (d) => (d.type === 'field' ? 'default' : 'pointer'))
      .call(
        d3
          .drag()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          })
      )
    nodeSelRef.current = node

    node.each(function (d) {
      const el = d3.select(this)
      const isFlow = d.type === 'flow'
      const isField = d.type === 'field'
      const color = isFlow ? '#0f172a' : nodeTypes[d.type]?.color || '#64748b'

      if (isFlow) {
        el.append('circle')
          .attr('r', 58)
          .attr('fill', 'rgba(6, 182, 212, 0.12)')
          .attr('class', 'glow-ring')
        el.append('circle')
          .attr('r', 46)
          .attr('fill', color)
          .attr('stroke', '#06b6d4')
          .attr('stroke-width', 2)
      } else if (isField) {
        const parentColor =
          nodeTypes[graphData.nodes.find((n) => n.id === d.parent)?.type]?.color || '#64748b'
        el.append('circle')
          .attr('r', 10)
          .attr('fill', '#ffffff')
          .attr('stroke', parentColor)
          .attr('stroke-width', 1.5)
      } else {
        const premium = nodeTypes[d.type]?.premium
        el.append('circle')
          .attr('r', premium ? 24 : 20)
          .attr('fill', '#ffffff')
          .attr('stroke', color)
          .attr('stroke-width', premium ? 3 : 2)

        if (graphLevel === 'L3') {
          const expanded = expandedNodes.has(d.id)
          el.append('circle')
            .attr('r', 7)
            .attr('cx', premium ? 18 : 15)
            .attr('cy', premium ? -18 : -15)
            .attr('fill', expanded ? '#ef4444' : '#10b981')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1.5)
          el.append('text')
            .attr('x', premium ? 18 : 15)
            .attr('y', premium ? -15 : -12)
            .attr('text-anchor', 'middle')
            .attr('fill', '#ffffff')
            .attr('font-size', 9)
            .attr('font-weight', 700)
            .text(expanded ? '−' : '+')
        }
      }
    })

    // 标注线层
    const leaderGroup = g.append('g').attr('class', 'leader-lines')
    const leader = leaderGroup
      .selectAll('line')
      .data(nodes)
      .enter()
      .append('line')
      .attr('class', 'leader-line')
      .attr('stroke', '#d1d5db')
      .attr('stroke-linecap', 'round')
    leaderSelRef.current = leader

    // 节点外置标签层
    const labelGroup = g.append('g').attr('class', 'node-labels')
    const nodeLabel = labelGroup
      .selectAll('g.node-label')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-label')
      .style('pointer-events', 'none')

    nodeLabel.each(function (d) {
      const el = d3.select(this)
      const text = getNodeLabelText(d)
      const labelWidth = estimateLabelWidth(text)
      const labelHeight = 18
      el.append('rect')
        .attr('width', labelWidth)
        .attr('height', labelHeight)
        .attr('rx', 4)
        .attr('fill', '#ffffff')
        .attr('stroke', '#e5e7eb')
        .attr('stroke-width', 1)
        .style('filter', 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.05))')
      el.append('text')
        .attr('x', labelWidth / 2)
        .attr('y', labelHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#1f2937')
        .attr('font-size', 12)
        .attr('font-weight', 500)
        .attr('class', 'node-label-text select-none')
        .text(text)
    })
    nodeLabelSelRef.current = nodeLabel

    node
      .on('mouseenter', (_, d) => setHoveredNode(d.id))
      .on('mouseleave', () => setHoveredNode(null))
      .on('click', (event, d) => {
        if (d.type === 'field') return
        setSelectedNodeId(d.id)
        if (clickTimerRef.current) {
          // 第二次点击属于双击，取消打开抽屉的定时器
          clearTimeout(clickTimerRef.current)
          clickTimerRef.current = null
          return
        }
        clickTimerRef.current = setTimeout(() => {
          clickTimerRef.current = null
          const resource = getResourceById(d.id)
          if (resource) setSelectedResource(resource)
        }, 220)
      })
      .on('dblclick', (event, d) => {
        if (graphLevel === 'L3' && d.type !== 'flow' && d.type !== 'field') {
          event.stopPropagation()
          toggleExpandedNode(d.id)
        }
      })

    svg.on('dblclick.zoom', null)
    svg.on('dblclick', () => {
      // allow dblclick to bubble to nodes
    })

    // 所有可视化元素创建完成后再应用初始 transform，避免 zoom 事件访问未初始化选择器
    svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(0.9))

    function getNodeRadius(d) {
      if (d.type === 'flow') return 46
      if (d.type === 'field') return 10
      return nodeTypes[d.type]?.premium ? 24 : 20
    }

    function getNodeLabelText(d) {
      if (d.type === 'field') return d.labelCn || d.label
      return d.label
    }

    function estimateLabelWidth(text) {
      return Math.max(32, text.length * 12 + 16)
    }

    function getLabelSide(d) {
      if (d.type === 'field') return 'right'
      const hasBottomLink = linksRef.current.some((l) => {
        const src = l.source
        const tgt = l.target
        return (src.id === d.id && tgt.y > d.y) || (tgt.id === d.id && src.y > d.y)
      })
      if (!hasBottomLink) return 'bottom'
      const hasTopLink = linksRef.current.some((l) => {
        const src = l.source
        const tgt = l.target
        return (src.id === d.id && tgt.y < d.y) || (tgt.id === d.id && src.y < d.y)
      })
      return hasTopLink ? 'right' : 'top'
    }

    function updateVisualPositions() {
      const k = transformRef.current.k

      // 初始化完成前可能被 zoom transform 事件触发，防御式跳过
      if (!linkCard || !leader || !nodeLabel) return

      // 连线中点卡片：屏幕空间大小固定
      linkCard.attr('transform', (d) => {
        const mx = (d.source.x + d.target.x) / 2
        const my = (d.source.y + d.target.y) / 2
        return `translate(${mx},${my}) scale(${1 / k})`
      })

      // 标注线：屏幕空间 1px 宽、8px 长、虚线
      leader
        .attr('x1', (d) => {
          const r = getNodeRadius(d)
          const side = getLabelSide(d)
          if (side === 'right') return d.x + r
          return d.x
        })
        .attr('y1', (d) => {
          const r = getNodeRadius(d)
          const side = getLabelSide(d)
          if (side === 'bottom') return d.y + r
          if (side === 'top') return d.y - r
          return d.y
        })
        .attr('x2', (d) => {
          const r = getNodeRadius(d)
          const side = getLabelSide(d)
          if (side === 'right') return d.x + r + 8 / k
          return d.x
        })
        .attr('y2', (d) => {
          const r = getNodeRadius(d)
          const side = getLabelSide(d)
          if (side === 'bottom') return d.y + r + 8 / k
          if (side === 'top') return d.y - r - 8 / k
          return d.y
        })
        .attr('stroke-width', 1 / k)
        .attr('stroke-dasharray', `${2 / k} ${2 / k}`)

      // 节点标签：屏幕空间大小固定
      nodeLabel.attr('transform', (d) => {
        const side = getLabelSide(d)
        const r = getNodeRadius(d)
        const text = getNodeLabelText(d)
        const width = estimateLabelWidth(text)
        const height = 18
        let lx = d.x
        let ly = d.y
        if (side === 'bottom') {
          lx = d.x - width / 2
          ly = d.y + r + 12 / k
        } else if (side === 'top') {
          lx = d.x - width / 2
          ly = d.y - r - 12 / k - height
        } else if (side === 'right') {
          lx = d.x + r + 12 / k
          ly = d.y - height / 2
        }
        return `translate(${lx},${ly}) scale(${1 / k})`
      })
    }

    simulation.on('tick', () => {
      // 字段节点按父节点均匀分布在固定半径圆上，避免自由力导向后混成一团
      const fieldGroups = {}
      nodes.forEach((n) => {
        if (n.type === 'field') {
          if (!fieldGroups[n.parent]) fieldGroups[n.parent] = []
          fieldGroups[n.parent].push(n)
        }
      })
      Object.entries(fieldGroups).forEach(([parentId, fields]) => {
        const parent = nodes.find((n) => n.id === parentId)
        if (!parent) return
        const radius = 90
        fields.forEach((f, i) => {
          const angle = (i / fields.length) * Math.PI * 2 - Math.PI / 2
          const targetX = parent.x + Math.cos(angle) * radius
          const targetY = parent.y + Math.sin(angle) * radius
          f.x += (targetX - f.x) * 0.25
          f.y += (targetY - f.y) * 0.25
          f.vx = 0
          f.vy = 0
        })
      })

      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y)

      node.attr('transform', (d) => `translate(${d.x},${d.y})`)

      updateVisualPositions()
    })

    // 初始位置立刻更新一次，避免首帧标签缺失
    updateVisualPositions()

    return () => {
      simulation.stop()
    }
  }, [
    dimensions,
    buildGraphData,
    setHoveredNode,
    setSelectedResource,
    setSelectedNodeId,
    graphLevel,
    expandedNodes,
    toggleExpandedNode,
  ])

  useEffect(() => {
    const node = nodeSelRef.current
    const link = linkSelRef.current
    const linkCard = linkCardSelRef.current
    const leader = leaderSelRef.current
    const nodeLabel = nodeLabelSelRef.current
    if (!node || !link || !leader || !nodeLabel) return

    if (!hoveredNode) {
      node.transition().duration(200).style('opacity', 1)
      link.transition().duration(200).style('opacity', 1)
      linkCard?.transition().duration(200).style('opacity', 1)
      leader.transition().duration(200).style('opacity', 1)
      nodeLabel.transition().duration(200).style('opacity', 1)
      return
    }

    const connected = new Set([hoveredNode])
    linksRef.current.forEach((l) => {
      if (l.source.id === hoveredNode) connected.add(l.target.id)
      if (l.target.id === hoveredNode) connected.add(l.source.id)
    })

    node.transition().duration(200).style('opacity', (d) => (connected.has(d.id) ? 1 : 0.2))

    link.transition().duration(200).style('opacity', (d) =>
      d.source.id === hoveredNode || d.target.id === hoveredNode ? 1 : 0.1
    )

    linkCard?.transition().duration(200).style('opacity', (d) =>
      d.source.id === hoveredNode || d.target.id === hoveredNode ? 1 : 0.1
    )

    leader
      .transition()
      .duration(200)
      .style('opacity', (d) => (connected.has(d.id) ? 1 : 0.2))
      .attr('stroke', (d) => (d.id === hoveredNode ? '#3b82f6' : '#d1d5db'))

    nodeLabel.transition().duration(200).style('opacity', (d) => (connected.has(d.id) ? 1 : 0.2))
  }, [hoveredNode])

  // 节点选中时标签加粗
  useEffect(() => {
    d3.select(svgRef.current)
      .selectAll('text.node-label-text')
      .attr('font-weight', (d) => (d.id === selectedNodeId ? 700 : 500))
  }, [selectedNodeId])

  useImperativeHandle(ref, () => ({
    resetView: () => {
      if (zoomRef.current && svgRef.current && dimensions.width && dimensions.height) {
        const svg = d3.select(svgRef.current)
        svg
          .transition()
          .duration(500)
          .call(
            zoomRef.current.transform,
            d3.zoomIdentity.translate(dimensions.width / 2, dimensions.height / 2).scale(0.9)
          )
      }
    },
    fitView: () => {
      if (!zoomRef.current || !svgRef.current || !nodesRef.current.length || !dimensions.width) return
      const svg = d3.select(svgRef.current)
      const g = svg.select('g')
      const bounds = g.node().getBBox()
      const fullWidth = dimensions.width
      const fullHeight = dimensions.height
      const width = bounds.width
      const height = bounds.height
      const midX = bounds.x + width / 2
      const midY = bounds.y + height / 2
      const scale = Math.min(fullWidth / (width + 80), fullHeight / (height + 80), 1.2)
      const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY]
      svg.transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale))
    },
  }))

  return (
    <div ref={containerRef} className="relative h-full w-full">
      <svg ref={svgRef} className="h-full w-full" />
    </div>
  )
})
