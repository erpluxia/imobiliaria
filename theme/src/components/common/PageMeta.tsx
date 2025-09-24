import { useEffect } from 'react'

export default function PageMeta({ title, description }: { title: string; description?: string }) {
  useEffect(() => {
    const prev = document.title
    document.title = title
    return () => { document.title = prev }
  }, [title])

  useEffect(() => {
    if (!description) return
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    const prev = meta.content
    meta.content = description
    return () => { meta && (meta.content = prev) }
  }, [description])

  return null
}
