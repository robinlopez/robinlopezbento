import { useState, useEffect, useRef, useCallback } from 'react'
import { Youtube, Play, Loader2 } from 'lucide-react'
import {
  SiX, SiInstagram, SiTiktok, SiYoutube, SiGithub, SiGitlab, SiLinkedin,
  SiFacebook, SiTwitch, SiDribbble, SiMedium, SiDevdotto, SiReddit,
  SiPinterest, SiThreads, SiBluesky, SiMastodon, SiSubstack, SiPatreon,
  SiKofi, SiBuymeacoffee, SiSnapchat, SiDiscord, SiTelegram, SiWhatsapp,
} from 'react-icons/si'
import { Globe, Link as LinkIcon } from 'lucide-react'
import type { IconType } from 'react-icons'
import type { LucideIcon } from 'lucide-react'


// Types
enum BlockType {
  LINK = 'LINK',
  TEXT = 'TEXT',
  MEDIA = 'MEDIA',
  SOCIAL = 'SOCIAL',
  SOCIAL_ICON = 'SOCIAL_ICON',
  MAP = 'MAP',
  SPACER = 'SPACER'
}

type SocialPlatform = 'x' | 'instagram' | 'tiktok' | 'youtube' | 'github' | 'gitlab' | 'linkedin' | 'facebook' | 'twitch' | 'dribbble' | 'medium' | 'devto' | 'reddit' | 'pinterest' | 'threads' | 'bluesky' | 'mastodon' | 'substack' | 'patreon' | 'kofi' | 'buymeacoffee' | 'website' | 'snapchat' | 'discord' | 'telegram' | 'whatsapp' | 'custom'

interface BlockData {
  id: string
  type: BlockType
  title?: string
  content?: string
  subtext?: string
  imageUrl?: string
  mediaPosition?: { x: number; y: number }
  colSpan: number
  rowSpan: number
  color?: string
  customBackground?: string
  textColor?: string
  gridColumn?: number
  gridRow?: number
  channelId?: string
  youtubeVideoId?: string
  channelTitle?: string
  youtubeMode?: 'single' | 'grid' | 'list'
  youtubeVideos?: Array<{ id: string; title: string; thumbnail: string }>
  socialPlatform?: SocialPlatform
  socialHandle?: string
  zIndex?: number
}


// Social platforms config
const SOCIAL_PLATFORMS: Record<string, { icon: IconType | LucideIcon; brandColor: string; buildUrl: (h: string) => string }> = {
  x: { icon: SiX, brandColor: '#000000', buildUrl: (h) => `https://x.com/${h}` },
  instagram: { icon: SiInstagram, brandColor: '#E4405F', buildUrl: (h) => `https://instagram.com/${h}` },
  tiktok: { icon: SiTiktok, brandColor: '#000000', buildUrl: (h) => `https://tiktok.com/@${h}` },
  youtube: { icon: SiYoutube, brandColor: '#FF0000', buildUrl: (h) => `https://youtube.com/@${h}` },
  github: { icon: SiGithub, brandColor: '#181717', buildUrl: (h) => `https://github.com/${h}` },
  gitlab: { icon: SiGitlab, brandColor: '#FC6D26', buildUrl: (h) => `https://gitlab.com/${h}` },
  linkedin: { icon: SiLinkedin, brandColor: '#0A66C2', buildUrl: (h) => `https://linkedin.com/in/${h}` },
  facebook: { icon: SiFacebook, brandColor: '#1877F2', buildUrl: (h) => `https://facebook.com/${h}` },
  twitch: { icon: SiTwitch, brandColor: '#9146FF', buildUrl: (h) => `https://twitch.tv/${h}` },
  dribbble: { icon: SiDribbble, brandColor: '#EA4C89', buildUrl: (h) => `https://dribbble.com/${h}` },
  medium: { icon: SiMedium, brandColor: '#000000', buildUrl: (h) => `https://medium.com/@${h}` },
  devto: { icon: SiDevdotto, brandColor: '#0A0A0A', buildUrl: (h) => `https://dev.to/${h}` },
  reddit: { icon: SiReddit, brandColor: '#FF4500', buildUrl: (h) => `https://reddit.com/user/${h}` },
  pinterest: { icon: SiPinterest, brandColor: '#BD081C', buildUrl: (h) => `https://pinterest.com/${h}` },
  threads: { icon: SiThreads, brandColor: '#000000', buildUrl: (h) => `https://threads.net/@${h}` },
  bluesky: { icon: SiBluesky, brandColor: '#0085FF', buildUrl: (h) => `https://bsky.app/profile/${h}` },
  mastodon: { icon: SiMastodon, brandColor: '#6364FF', buildUrl: (h) => h },
  substack: { icon: SiSubstack, brandColor: '#FF6719', buildUrl: (h) => `https://${h}.substack.com` },
  patreon: { icon: SiPatreon, brandColor: '#FF424D', buildUrl: (h) => `https://patreon.com/${h}` },
  kofi: { icon: SiKofi, brandColor: '#FF5E5B', buildUrl: (h) => `https://ko-fi.com/${h}` },
  buymeacoffee: { icon: SiBuymeacoffee, brandColor: '#FFDD00', buildUrl: (h) => `https://buymeacoffee.com/${h}` },
  snapchat: { icon: SiSnapchat, brandColor: '#FFFC00', buildUrl: (h) => `https://snapchat.com/add/${h}` },
  discord: { icon: SiDiscord, brandColor: '#5865F2', buildUrl: (h) => h },
  telegram: { icon: SiTelegram, brandColor: '#26A5E4', buildUrl: (h) => `https://t.me/${h}` },
  whatsapp: { icon: SiWhatsapp, brandColor: '#25D366', buildUrl: (h) => `https://wa.me/${h}` },
  website: { icon: Globe, brandColor: '#6B7280', buildUrl: (h) => h.startsWith('http') ? h : `https://${h}` },
  custom: { icon: LinkIcon, brandColor: '#6B7280', buildUrl: (h) => h },
}

// Format follower count: 220430 → "220k", 1500000 → "1.5M"
const formatFollowerCount = (count: number | undefined): string => {
  if (count === undefined || count === null) return ''
  if (count < 1000) return String(count)
  if (count < 1000000) {
    const k = count / 1000
    return k >= 100 ? `${Math.round(k)}k` : `${k.toFixed(k % 1 === 0 ? 0 : 1)}k`
  }
  const m = count / 1000000
  return m >= 100 ? `${Math.round(m)}M` : `${m.toFixed(m % 1 === 0 ? 0 : 1)}M`
}


// Tilt effect hook
const useTiltEffect = (isEnabled = true) => {
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({})
  const elementRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isEnabled || !elementRef.current) return
    const rect = elementRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -10
    const rotateY = ((x - centerX) / centerX) * 10
    const glareX = (x / rect.width) * 100
    const glareY = (y / rect.height) * 100
    const shadowX = rotateY * 1.5
    const shadowY = rotateX * -1.5
    setTiltStyle({
      transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      boxShadow: `${shadowX}px ${shadowY}px 25px rgba(0,0,0,0.15), 0 8px 30px rgba(0,0,0,0.1)`,
      transition: 'transform 0.1s ease-out, box-shadow 0.1s ease-out',
      '--glare-x': `${glareX}%`,
      '--glare-y': `${glareY}%`,
    } as React.CSSProperties)
  }, [isEnabled])

  const handleMouseLeave = useCallback(() => {
    if (!isEnabled) return
    setTiltStyle({
      transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.5s ease-out, box-shadow 0.5s ease-out',
    })
  }, [isEnabled])

  return { elementRef, tiltStyle, handleMouseMove, handleMouseLeave }
}


// Block component
const Block = ({ block }: { block: BlockData }) => {
  const { elementRef, tiltStyle, handleMouseMove, handleMouseLeave } = useTiltEffect(true)
  const [videos, setVideos] = useState(block.youtubeVideos || [])
  const [loading, setLoading] = useState(false)
  const mediaPos = block.mediaPosition || { x: 50, y: 50 }

  useEffect(() => {
    if (block.type === BlockType.SOCIAL && block.channelId && !block.youtubeVideos?.length) {
      setLoading(true)
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${block.channelId}`
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`
      fetch(proxyUrl).then(r => r.text()).then(text => {
        const parser = new DOMParser()
        const xml = parser.parseFromString(text, 'text/xml')
        const entries = Array.from(xml.querySelectorAll('entry'))
        const vids = entries.slice(0, 4).map(e => {
          const id = e.getElementsByTagName('yt:videoId')[0]?.textContent || ''
          const title = e.getElementsByTagName('title')[0]?.textContent || ''
          return { id, title, thumbnail: `https://img.youtube.com/vi/${id}/mqdefault.jpg` }
        })
        if (vids.length) setVideos(vids)
      }).catch(() => {}).finally(() => setLoading(false))
    }
  }, [block.channelId, block.youtubeVideos, block.type])

  const getBorderRadius = () => {
    const minDim = Math.min(block.colSpan, block.rowSpan)
    if (minDim <= 1) return '0.5rem'
    if (minDim <= 2) return '0.625rem'
    if (minDim <= 3) return '0.75rem'
    return '0.875rem'
  }
  const borderRadius = getBorderRadius()

  const gridStyle: React.CSSProperties = {}
  if (block.gridColumn !== undefined) {
    gridStyle.gridColumnStart = block.gridColumn
    gridStyle.gridColumnEnd = block.gridColumn + block.colSpan
  }
  if (block.gridRow !== undefined) {
    gridStyle.gridRowStart = block.gridRow
    gridStyle.gridRowEnd = block.gridRow + block.rowSpan
  }

  const handleClick = () => {
    let url = block.content
    if (block.type === BlockType.SOCIAL && block.socialPlatform && block.socialHandle) {
      url = SOCIAL_PLATFORMS[block.socialPlatform]?.buildUrl(block.socialHandle)
    } else if (block.channelId) {
      url = `https://youtube.com/channel/${block.channelId}`
    }
    if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const isYoutube = block.type === BlockType.SOCIAL && block.channelId
  const activeVideoId = block.youtubeVideoId || videos[0]?.id
  const isRichYT = isYoutube && activeVideoId && block.youtubeMode !== 'grid' && block.youtubeMode !== 'list'
  const isYTGrid = isYoutube && (block.youtubeMode === 'grid' || block.youtubeMode === 'list')
  const isLinkImg = block.type === BlockType.LINK && block.imageUrl

  if (block.type === BlockType.SPACER) return <div style={{ borderRadius, ...gridStyle }} className="h-full" />

  if (block.type === BlockType.SOCIAL_ICON) {
    const platform = SOCIAL_PLATFORMS[block.socialPlatform || 'custom']
    const Icon = platform?.icon
    const url = block.socialHandle ? platform?.buildUrl(block.socialHandle) : ''
    return (
      <a href={url || undefined} target="_blank" rel="noopener noreferrer" onClick={handleClick}
        className={`bento-item relative h-full ${block.color || 'bg-white'} flex items-center justify-center shadow-sm border border-gray-100 hover:shadow-md transition-all`}
        style={{ borderRadius, ...gridStyle, ...(block.customBackground ? { background: block.customBackground } : {}) }}>
        {Icon && <span style={{ color: platform.brandColor }}><Icon size={24} /></span>}
      </a>
    )
  }

  if (isYTGrid) {
    return (
      <div onClick={handleClick} style={{ borderRadius, ...gridStyle, ...(block.customBackground ? { background: block.customBackground } : {}) }}
        className={`bento-item group cursor-pointer h-full ${block.color || 'bg-white'} ring-1 ring-black/5 shadow-sm hover:shadow-xl transition-all`}>
        <div className="w-full h-full flex flex-col p-2 md:p-3">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
            <div className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center"><Youtube size={12} /></div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[10px] md:text-xs font-bold text-gray-900 truncate">{block.channelTitle || 'YouTube'}</h3>
              <span className="text-[8px] text-gray-400">Latest videos</span>
            </div>
          </div>
          {loading ? <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-gray-300" size={16} /></div> : (
            <div className="flex-1 grid grid-cols-2 gap-1 overflow-hidden">
              {videos.slice(0, 4).map((v, i) => (
                <a key={i} href={`https://youtube.com/watch?v=${v.id}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="relative overflow-hidden rounded bg-gray-100 group/vid">
                  <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 group-hover/vid:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover/vid:opacity-100 transition-opacity">
                      <Play size={10} className="text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  let bgStyle: React.CSSProperties = block.customBackground ? { background: block.customBackground } : {}
  if (isRichYT) bgStyle = { backgroundImage: `url(https://img.youtube.com/vi/${activeVideoId}/maxresdefault.jpg)`, backgroundSize: 'cover', backgroundPosition: 'center' }
  else if (isLinkImg && block.imageUrl) bgStyle = { backgroundImage: `url(${block.imageUrl})`, backgroundSize: 'cover', backgroundPosition: `${mediaPos.x}% ${mediaPos.y}%` }

  return (
    <div onClick={handleClick} style={{ ...gridStyle }} className="cursor-pointer h-full transform-gpu">
      <div ref={elementRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
        style={{ ...bgStyle, borderRadius, ...tiltStyle, width: '100%', height: '100%', transformStyle: 'preserve-3d' }}
        className={`bento-item group relative overflow-hidden w-full h-full ${!block.customBackground && !isLinkImg && !isRichYT ? (block.color || 'bg-white') : ''} ${block.textColor || 'text-gray-900'} ring-1 ring-black/5 shadow-sm transition-all`}>
        <div className="absolute inset-0 pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgba(255,255,255,0.25) 0%, transparent 60%)' }} />
        {(isRichYT || isLinkImg) && (block.title || block.subtext) && (
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-0" />
        )}
        <div className="w-full h-full relative z-10">
          {block.type === BlockType.MEDIA && block.imageUrl ? (
            <div className="w-full h-full relative overflow-hidden">
              {/\.(mp4|webm|ogg|mov)$/i.test(block.imageUrl) ? (
                <video src={block.imageUrl} className="full-img" style={{ objectPosition: `${mediaPos.x}% ${mediaPos.y}%` }} autoPlay loop muted playsInline />
              ) : (
                <img src={block.imageUrl} alt={block.title || ''} className="full-img" style={{ objectPosition: `${mediaPos.x}% ${mediaPos.y}%` }} />
              )}
              {block.title && <div className="media-overlay"><p className="media-title text-sm">{block.title}</p>{block.subtext && <p className="media-subtext">{block.subtext}</p>}</div>}
            </div>
          ) : block.type === BlockType.MAP ? (
            <div className="w-full h-full relative bg-gray-100 overflow-hidden">
              <iframe width="100%" height="100%" className="opacity-95 grayscale-[20%] group-hover:grayscale-0 transition-all"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(block.content || 'Paris')}&t=&z=13&ie=UTF8&iwloc=&output=embed`} loading="lazy" sandbox="allow-scripts allow-same-origin" />
              {block.title && <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent"><p className="font-semibold text-white text-sm">{block.title}</p></div>}
            </div>
          ) : isRichYT ? (
            <div className="w-full h-full relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Play size={16} className="text-white ml-0.5" fill="white" />
                </div>
              </div>
              {(block.channelTitle || block.title) && <div className="absolute bottom-0 left-0 right-0 p-3"><h3 className="font-semibold text-white text-sm drop-shadow-lg">{block.channelTitle || block.title}</h3></div>}
            </div>
          ) : (
            <div className="p-3 h-full flex flex-col justify-between">
              {block.type === BlockType.SOCIAL && block.socialPlatform && (() => {
                const platform = SOCIAL_PLATFORMS[block.socialPlatform]
                const Icon = platform?.icon
                return Icon ? (
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${block.textColor === 'text-white' || isLinkImg ? 'bg-white/20 backdrop-blur-sm' : 'bg-gray-100'}`}
                    style={{ color: block.textColor === 'text-brand' ? platform.brandColor : undefined }}>
                    <Icon size={14} />
                  </div>
                ) : null
              })()}
              <div className={block.type === BlockType.TEXT ? 'flex flex-col justify-center h-full' : 'mt-auto'}>
                <h3 className={`font-bold leading-tight ${isLinkImg ? 'text-white drop-shadow-lg' : ''}`}>{block.title}</h3>
                {block.subtext && <p className={`text-xs mt-1 ${isLinkImg ? 'text-white/80' : 'opacity-60'}`}>{block.subtext}</p>}
                {block.type === BlockType.TEXT && block.content && <p className="opacity-70 mt-2 text-sm whitespace-pre-wrap">{block.content}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


// Profile data
const profile = {"name":"Robin Lopez","bio":"Product Designer passionné chez 4SH France, et freelance sur mon temps libre.\nOSS Contributeur sur l’app Voxxrin.\nAu-delà des pixels et du code, je suis passionné par la photo/vidéo et l’art dans toutes ses formes.","avatarUrl":"/assets/avatar.png","theme":"light","primaryColor":"blue","showBranding":false,"analytics":{"enabled":false,"supabaseUrl":""},"socialAccounts":[{"platform":"instagram","handle":"design.robinlopez"}],"avatarStyle":{"shape":"circle","shadow":true,"border":true,"borderColor":"#ffffff","borderWidth":4},"showSocialInHeader":false,"openGraph":{"title":"Robin Lopez","description":"Product Designer passionné chez 4SH France, et freelance sur mon temps libre.\nOSS Contributeur sur l’app Voxxrin.\nAu-delà des pixels et du code, je suis passionné par la photo/vidéo et l’art dans tout","image":"data:image/jpeg;base64,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MKuGKuW5Q9EhpW3q8/8Av7QEp2/3+6zbZvHf/fzEdl5/tg8fxBoioYw1NBh4iDdmJtAsHyGDcQKxmUGNGInOnNJva0tzNiAIrnZXcui7iKVwTS/mYh4mE6FxeTLruZmsIUOuBWnaYpoweJddcBc4be7UNUJUerKq3ggyPMDC8sCnwqGyDjqZ38yrc59JF5g0sLidQXYdpVLHaNKXfeD1aHUEtNsvWJe+YRd131L8VOgxMfJnOcIYU1cwLaSqixYxBLojFdYxAmPvLRyVg6RdwQNUEdnf4y4/SUtYvGO9h6uRzKApmge0dywgPqgVjhHbS18MoVZGobuSECcTmNQXmeZkOqkGK1M6pSZukc84m4OZiVy1BZwlxW6IvGTSyxh48WlD7nPnGUH8Ql+XqKlSpQKE40aFEYsx5l6KMCK5nLh1jMyj4zT0ZSjlCC96Tam5nromO65jp8TAetWzW1YbhP1YllD1tCGrpVYhvOYKvSStwQ95m8yG9ua4m5jSMTMqOgKmXigIMAhMMU6TKVISjfdz/nDbhfSNWu2Gjqc8KSga/CPJUYcZRdZ8TqYfEKzDFVMLi4eYUUCZbyZxv95tRKqTYpWJHrx1hlcmcFLqj8QmR7lk5JndJc3y7gtF8Tro1CSbstsLT5YViaNQcVMzd4hBdViWAqNRmmh4gu4ATEYZe/klDjfeOtEDCJ295jqustep0wgt1dYmoQW7GK6iC0RhatcTNncpcV1h1f7yt+ISDaOJi9SM51c3e0AoY8Yj4BluGSyhG0uKLrgjh2aZhXtKm4zmRjXWUZMe/ZrW4zVxMCdxXtT4msuVbI9VazJGCJ4w15gpusvtemu4sKj40//ZICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA=","siteName":"robinlopez-bento","twitterCardType":"summary"}}
const blocks: BlockData[] = [{"id":"bento_1770037182632_pl6fw2g91","type":"LINK","title":"Portfolio","subtext":"Visit my site","content":"https://robinlopez.fr/","colSpan":2,"rowSpan":2,"gridColumn":1,"gridRow":1,"color":"bg-white","textColor":"text-gray-900"},{"id":"vihkpeuyf","type":"SOCIAL","title":"LinkedIn","content":"https://www.linkedin.com/in/robin-lopez-designer/","colSpan":2,"rowSpan":2,"color":"bg-white","textColor":"text-brand","gridColumn":3,"gridRow":1,"socialPlatform":"linkedin","socialHandle":"robin-lopez-designer","subtext":"robin-lopez-designer"},{"id":"n9h17n69f","type":"SOCIAL","title":"Bluesky","content":"https://bsky.app/profile/lopezrobin.bsky.social","colSpan":2,"rowSpan":2,"color":"bg-white","textColor":"text-brand","gridColumn":5,"gridRow":1,"socialPlatform":"bluesky","socialHandle":"lopezrobin.bsky.social","subtext":"lopezrobin.bsky.social"},{"id":"6ucopfdm7","type":"SOCIAL","title":"TikTok","content":"https://www.tiktok.com/@robinlopez.crea","colSpan":2,"rowSpan":2,"color":"bg-white","textColor":"text-brand","gridColumn":7,"gridRow":1,"socialPlatform":"tiktok","socialHandle":"robinlopez.crea","subtext":"@robinlopez.crea"},{"id":"k7hu0xyv0","type":"SPACER","title":"Spacer","content":"","colSpan":9,"rowSpan":1,"color":"bg-transparent","textColor":"text-gray-900","gridColumn":1,"gridRow":5},{"id":"e6a9d1ygp","type":"TEXT","title":"Explorez mon travail ↯","content":"","colSpan":9,"rowSpan":1,"color":"bg-gray-100","textColor":"text-gray-900","gridColumn":1,"gridRow":6},{"id":"ti2dz49iw","type":"SOCIAL","title":"GitHub","content":"https://github.com/robinlopez","colSpan":2,"rowSpan":2,"color":"bg-gray-900","textColor":"text-white","gridColumn":1,"gridRow":7,"socialPlatform":"github","socialHandle":"robinlopez","subtext":"@robinlopez"},{"id":"w97mwnnbc","type":"SOCIAL","title":"Instagram","content":"https://www.instagram.com/design.robinlopez%2F/","colSpan":2,"rowSpan":2,"color":"bg-white","textColor":"text-gray-900","gridColumn":3,"gridRow":7,"socialPlatform":"instagram","socialHandle":"design.robinlopez/","subtext":"@design.robinlopez"},{"id":"702b7993-48d1-444c-be11-c1ebe3cf1f8f","type":"SOCIAL","title":"Dribbble","content":"https://dribbble.com/lopezrobin","colSpan":2,"rowSpan":2,"color":"bg-pink-500","textColor":"text-brand","gridColumn":5,"gridRow":7,"socialPlatform":"dribbble","socialHandle":"lopezrobin","subtext":"lopezrobin"},{"id":"1e7d0c66-afb0-4b6f-bcec-f1aa0a66aa66","type":"SOCIAL","title":"Behance","content":"https://www.behance.net/lopezrobin","colSpan":2,"rowSpan":2,"color":"bg-blue-500","textColor":"text-white","gridColumn":7,"gridRow":7,"socialPlatform":"custom","socialHandle":"https://www.behance.net/lopezrobin","subtext":""},{"id":"f7xxfix5e","type":"SPACER","title":"Spacer","content":"","colSpan":9,"rowSpan":1,"color":"bg-transparent","textColor":"text-gray-900","gridColumn":1,"gridRow":9},{"id":"54cfcbfe-820b-4396-9a31-e0e6fd855ed3","type":"TEXT","title":"Voxxrin - OSS project","content":"","colSpan":9,"rowSpan":1,"color":"bg-gray-100","textColor":"text-gray-900","gridColumn":1,"gridRow":10},{"id":"ua2uymv2o","type":"MEDIA","title":"New Block","content":"","colSpan":5,"rowSpan":6,"color":"bg-white","textColor":"text-gray-900","gridColumn":1,"gridRow":11,"imageUrl":"/assets/block-ua2uymv2o.png"},{"id":"tqudjl0ma","type":"TEXT","title":"The application made for all conference players 🚀","content":"Adopt the application now👇","colSpan":3,"rowSpan":3,"color":"bg-gray-900","textColor":"text-white","gridColumn":6,"gridRow":11},{"id":"texzcer4b","type":"LINK","title":"Voxxrin App","content":"https://app.voxxr.in/event-selector","colSpan":3,"rowSpan":3,"color":"bg-white","textColor":"text-gray-900","gridColumn":6,"gridRow":14,"imageUrl":"/assets/block-texzcer4b.png","subtext":"Your conference companion"},{"id":"exhujtnxg","type":"SOCIAL","title":"GitHub","content":"https://github.com/voxxrin%2Fvoxxrin3","colSpan":5,"rowSpan":2,"color":"bg-gray-900","textColor":"text-white","gridColumn":1,"gridRow":17,"socialPlatform":"github","socialHandle":"voxxrin/voxxrin3","subtext":"@voxxrin/voxxrin3"},{"id":"midq3wivj","type":"LINK","title":"Voxxrin Website","content":"https://www.voxxr.in/","colSpan":3,"rowSpan":2,"color":"bg-white","textColor":"text-gray-900","gridColumn":6,"gridRow":17},{"id":"94zuknhxf","type":"SPACER","title":"Spacer","content":"","colSpan":9,"rowSpan":1,"color":"bg-transparent","textColor":"text-gray-900","gridColumn":1,"gridRow":19},{"id":"17f6164a-779f-41df-a3a6-1daf3c75ee7a","type":"TEXT","title":"Plugins","content":"","colSpan":9,"rowSpan":1,"color":"bg-gray-100","textColor":"text-gray-900","gridColumn":1,"gridRow":20},{"id":"dls804yty","type":"LINK","title":"Token Forge ","content":"https://www.figma.com/community/plugin/1566133735926608173/token-forge-variables-tokens-builder","colSpan":5,"rowSpan":5,"color":"bg-white","textColor":"text-gray-900","gridColumn":1,"gridRow":21,"imageUrl":"/assets/block-dls804yty.png","subtext":"Plugin Figma pour exporter, synchroniser et auditer vos design tokens vers le code, tout en conservant aliases, hiérarchie et standard W3C."}]

// Analytics hook (uses Edge Function - no API keys exposed)
const useAnalytics = () => {
  const sessionStart = useRef(Date.now())
  const maxScroll = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0
      maxScroll.current = Math.max(maxScroll.current, scrollPercent)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const config = profile.analytics
    if (!config?.enabled || !config?.supabaseUrl) return

    const track = async (eventType: 'page_view' | 'click', extra: { blockId?: string; destinationUrl?: string } = {}) => {
      const utm = new URLSearchParams(window.location.search)
      const payload = {
        siteId: '',
        event: eventType,
        blockId: extra.blockId,
        destinationUrl: extra.destinationUrl,
        pageUrl: window.location.href,
        referrer: document.referrer || undefined,
        utm: {
          source: utm.get('utm_source') || undefined,
          medium: utm.get('utm_medium') || undefined,
          campaign: utm.get('utm_campaign') || undefined,
          term: utm.get('utm_term') || undefined,
          content: utm.get('utm_content') || undefined,
        },
        language: navigator.language,
        screenW: window.screen?.width,
        screenH: window.screen?.height,
      }
      // Use Edge Function endpoint (secure - no API keys needed)
      const endpoint = config.supabaseUrl.replace(/\/+$/, '') + '/functions/v1/openbento-analytics-track'
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {})
    }

    track('page_view')

    // Note: session_end is not supported by the Edge Function, only page_view and click
    // If you need session tracking, extend the Edge Function
  }, [])
}


// Mobile layout helper - calculates responsive grid spans
const getMobileLayout = (block: BlockData) => ({
  colSpan: block.colSpan >= 5 ? 2 : 1,
  rowSpan: block.colSpan >= 3 && block.colSpan < 5 ? Math.max(block.rowSpan, 2) : block.rowSpan
})

// Sort blocks for mobile
const sortedBlocks = [...blocks].sort((a, b) => {
  const aRow = a.gridRow ?? 999
  const bRow = b.gridRow ?? 999
  const aCol = a.gridColumn ?? 999
  const bCol = b.gridColumn ?? 999
  if (aRow !== bRow) return aRow - bRow
  return aCol - bCol
})

export default function App() {
  useAnalytics()

  const avatarStyle = { borderRadius: '9999px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', border: '4px solid #ffffff' }
  const bgStyle: React.CSSProperties = { backgroundColor: '#f8fafc' }

  return (
    <div className="min-h-screen font-sans" style={bgStyle}>
      
      <div className="relative z-10">

        {/* Desktop Layout */}
        <div className="hidden lg:flex">
          <div className="fixed left-0 top-0 w-[420px] h-screen flex flex-col justify-center items-start px-12">
            <div className="w-40 h-40 overflow-hidden bg-gray-100 mb-8" style={avatarStyle}>
              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-3">{profile.name}</h1>
            <p className="text-base text-gray-500 font-medium whitespace-pre-wrap max-w-xs">{profile.bio}</p>
            
          </div>
          <div className="ml-[420px] flex-1 p-12">
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(9, 1fr)', gridAutoRows: '64px' }}>
              {blocks.map(block => <Block key={block.id} block={block} />)}
            </div>
          </div>
        </div>


        {/* Mobile Layout - 2 columns adaptive */}
        <div className="lg:hidden">
          <div className="p-4 pt-8 flex flex-col items-center text-center">
            <div className="w-24 h-24 mb-4 overflow-hidden bg-gray-100" style={avatarStyle}>
              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 mb-2">{profile.name}</h1>
            <p className="text-sm text-gray-500 font-medium whitespace-pre-wrap max-w-xs">{profile.bio}</p>
            
          </div>
          <div className="p-4">
            <div className="grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gridAutoRows: '80px', gap: '12px' }}>
              {sortedBlocks.map(block => {
                const mobile = getMobileLayout(block)
                return (
                  <div key={block.id} style={{ gridColumn: `span ${mobile.colSpan}`, gridRow: `span ${mobile.rowSpan}` }}>
                    <Block block={{ ...block, gridColumn: undefined, gridRow: undefined }} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}
