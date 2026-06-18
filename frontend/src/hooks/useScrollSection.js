import { useAppStore } from '@/stores/appStore'

export function useScrollSection() {
  const { section, setSection } = useAppStore()
  return { section, setSection }
}
