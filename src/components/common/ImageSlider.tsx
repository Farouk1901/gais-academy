import { useEffect, useRef } from 'react';

interface ImageSliderProps {
  images: { src: string; alt: string }[];
  /** Speed in pixels per second — default 40 */
  speed?: number;
}

/**
 * Infinite auto-scrolling image strip (CSS-only marquee effect via JS RAF).
 * Duplicates the image list so the loop is seamless.
 */
export default function ImageSlider({ images, speed = 40 }: ImageSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef   = useRef(0);
  const rafRef   = useRef<number>(0);
  const lastRef  = useRef<number>(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const animate = (ts: number) => {
      const dt = lastRef.current ? (ts - lastRef.current) / 1000 : 0;
      lastRef.current = ts;

      const halfW = track.scrollWidth / 2; // we duplicated the list
      posRef.current = (posRef.current + speed * dt) % halfW;
      track.style.transform = `translateX(${posRef.current}px)`;

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [speed]);

  // Duplicate list for seamless loop
  const doubled = [...images, ...images];

  return (
    <div className="overflow-hidden w-full">
      {/* RTL sites scroll naturally right→left; we animate left→right (positive X)
          so images "enter" from the right, matching Arabic reading direction. */}
      <div
        ref={trackRef}
        className="flex gap-4 will-change-transform"
        style={{ width: 'max-content' }}
      >
        {doubled.map((img, i) => (
          <div
            key={i}
            className="shrink-0 w-48 md:w-56 aspect-[4/3] rounded-xl overflow-hidden border border-border/30"
          >
            <img
              src={img.src}
              alt={img.alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}



