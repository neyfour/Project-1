import { useInView } from "react-intersection-observer"

interface LazyImageProps {
  src: string
  alt: string
  className?: string
}

export default function LazyImage({ src, alt, className = "" }: LazyImageProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: "50px 0px",
  })

  return (
    <div ref={ref} className={`relative ${className}`}>
      {inView ? (
        <img src={src} alt={alt} className={`transition-opacity duration-300 ${className}`} loading="lazy" />
      ) : (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />
      )}
    </div>
  )
}

