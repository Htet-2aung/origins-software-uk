'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function MotionEnhancements() {
  const pathname = usePathname();

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>('[data-motion]'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.documentElement.classList.add('motion-ready');

    elements.forEach((element) => element.classList.remove('motion-pending', 'is-entered'));
    if (reduceMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-entered'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-entered');
          entry.target.classList.remove('motion-pending');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    elements.forEach((element) => {
      if (element.getBoundingClientRect().top > window.innerHeight * 0.88) {
        element.classList.add('motion-pending');
        observer.observe(element);
      } else {
        element.classList.add('is-entered');
      }
    });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
