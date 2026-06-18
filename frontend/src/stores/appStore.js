import { create } from 'zustand'

export const useAppStore = create((set) => ({
  // 当前屏：hero | graph
  section: 'hero',
  setSection: (section) => set({ section }),

  // 搜索
  searchQuery: '',
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  showResults: false,
  setShowResults: (showResults) => set({ showResults }),

  // 资源详情弹窗
  selectedResource: null,
  setSelectedResource: (selectedResource) => set({ selectedResource }),

  // 节点选中态（用于标签加粗）
  selectedNodeId: null,
  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),

  // 权限弹窗（保留给自助开发）
  permissionModalOpen: false,
  permissionAction: null,
  setPermissionModal: (open, action = null) =>
    set({ permissionModalOpen: open, permissionAction: action }),

  // 图谱高亮
  hoveredNode: null,
  setHoveredNode: (hoveredNode) => set({ hoveredNode }),

  // 航贸知识图谱状态
  graphLevel: 'L2',
  setGraphLevel: (graphLevel) =>
    set({ graphLevel, expandedNodes: new Set() }),

  graphVisibility: {
    flow: true,
    table: true,
    metric: true,
    api: true,
    dataset: true,
    field: true,
  },
  setGraphVisibility: (graphVisibility) => set({ graphVisibility }),
  toggleGraphVisibility: (key) =>
    set((state) => ({
      graphVisibility: {
        ...state.graphVisibility,
        [key]: !state.graphVisibility[key],
      },
    })),

  graphLinkVisibility: {
    flow: true,
    belong: true,
    lineage: true,
    semantic: true,
  },
  setGraphLinkVisibility: (graphLinkVisibility) => set({ graphLinkVisibility }),
  toggleGraphLinkVisibility: (key) =>
    set((state) => ({
      graphLinkVisibility: {
        ...state.graphLinkVisibility,
        [key]: !state.graphLinkVisibility[key],
      },
    })),

  expandedNodes: new Set(),
  setExpandedNodes: (expandedNodes) => set({ expandedNodes }),
  toggleExpandedNode: (id) =>
    set((state) => {
      const next = new Set(state.expandedNodes)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { expandedNodes: next }
    }),
  resetExpandedNodes: () => set({ expandedNodes: new Set() }),
}))
