import { Routes, Route } from 'react-router-dom'
import { useScrollSection } from '@/hooks/useScrollSection'
import { HeroSection } from '@/sections/HeroSection'
import { GraphSection } from '@/sections/GraphSection'
import { ResourceDrawer } from '@/components/ResourceDrawer'
import { AnalysisWorkbench } from '@/components/AnalysisWorkbench'
import { useAppStore } from '@/stores/appStore'
import { motion, AnimatePresence } from 'framer-motion'

function Portal() {
  useScrollSection()
  const { section } = useAppStore()

  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-50">
      <AnimatePresence mode="wait">
        {section === 'hero' ? (
          <motion.div
            key="hero"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <HeroSection />
          </motion.div>
        ) : (
          <motion.div
            key="graph"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <GraphSection />
          </motion.div>
        )}
      </AnimatePresence>

      <ResourceDrawer />
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Portal />} />
      <Route path="/analysis" element={<AnalysisWorkbench />} />
    </Routes>
  )
}

export default App
