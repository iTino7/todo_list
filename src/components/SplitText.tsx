import React, { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText as GSAPSplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, GSAPSplitText, useGSAP);

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  ease?: string | ((t: number) => number);
  splitType?: 'chars' | 'words' | 'lines' | 'words, chars';
  from?: gsap.TweenVars;
  to?: gsap.TweenVars;
  threshold?: number;
  rootMargin?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  textAlign?: React.CSSProperties['textAlign'];
  onLetterAnimationComplete?: () => void;
  children?: React.ReactNode;
  animateOnce?: boolean;
  animationKey?: string;
}

const SplitText: React.FC<SplitTextProps> = ({
  text,
  className = '',
  delay = 100,
  duration = 0.6,
  ease = 'power3.out',
  splitType = 'chars',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  threshold = 0.1,
  rootMargin = '-100px',
  tag = 'p',
  textAlign = 'center',
  onLetterAnimationComplete,
  children,
  animateOnce = false,
  animationKey = 'split-text-animated'
}) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const childrenRef = useRef<HTMLSpanElement>(null);
  const animationCompletedRef = useRef(false);
  const hasAnimatedThisMount = useRef(false);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (document.fonts.status === 'loaded') {
      setFontsLoaded(true);
    } else {
      document.fonts.ready.then(() => {
        setFontsLoaded(true);
      });
    }
  }, []);

  useGSAP(
    () => {
      if (!ref.current || !text || !fontsLoaded) return;
      
      // Se animateOnce è true e l'animazione è già stata eseguita in questo montaggio, applica direttamente gli stati finali
      if (animateOnce && hasAnimatedThisMount.current) {
        const el = ref.current as HTMLElement & {
          _rbsplitInstance?: GSAPSplitText;
        };
        
        // Se esiste già un'istanza, non ricrearla
        if (el._rbsplitInstance) {
          return;
        }
        
        let targets: Element[] = [];
        const splitInstance = new GSAPSplitText(el, {
          type: splitType,
          smartWrap: true,
          autoSplit: splitType === 'lines',
          reduceWhiteSpace: false
        });
        
        el._rbsplitInstance = splitInstance;
        
        if (splitType.includes('chars') && splitInstance.chars?.length) {
          targets = splitInstance.chars;
        } else if (splitType.includes('words') && splitInstance.words.length) {
          targets = splitInstance.words;
        } else if (splitType.includes('lines') && splitInstance.lines.length) {
          targets = splitInstance.lines;
        }
        
        if (children && childrenRef.current) {
          targets.push(childrenRef.current);
        }
        
        // Applica direttamente gli stati finali senza animazione
        gsap.set(targets, { ...to, immediateRender: true });
        return;
      }
      
      const el = ref.current as HTMLElement & {
        _rbsplitInstance?: GSAPSplitText;
      };

      if (el._rbsplitInstance) {
        try {
          el._rbsplitInstance.revert();
        } catch (_) {}
        el._rbsplitInstance = undefined;
      }

      const startPct = (1 - threshold) * 100;
      const marginMatch = /^(-?\d+(?:\.\d+)?)(px|em|rem|%)?$/.exec(rootMargin);
      const marginValue = marginMatch ? parseFloat(marginMatch[1]) : 0;
      const marginUnit = marginMatch ? marginMatch[2] || 'px' : 'px';
      const sign =
        marginValue === 0
          ? ''
          : marginValue < 0
            ? `-=${Math.abs(marginValue)}${marginUnit}`
            : `+=${marginValue}${marginUnit}`;
      const start = `top ${startPct}%${sign}`;
      let targets: Element[] = [];
      const assignTargets = (self: GSAPSplitText) => {
        if (splitType.includes('chars') && (self as GSAPSplitText).chars?.length)
          targets = (self as GSAPSplitText).chars;
        if (!targets.length && splitType.includes('words') && self.words.length) targets = self.words;
        if (!targets.length && splitType.includes('lines') && self.lines.length) targets = self.lines;
        if (!targets.length) targets = self.chars || self.words || self.lines;
      };
      const splitInstance = new GSAPSplitText(el, {
        type: splitType,
        smartWrap: true,
        autoSplit: splitType === 'lines',
        linesClass: 'split-line',
        wordsClass: 'split-word',
        charsClass: 'split-char',
        reduceWhiteSpace: false,
        onSplit: (self: GSAPSplitText) => {
          assignTargets(self);
          const allTargets = [...targets];
          
          // Se ci sono children, li aggiungiamo ai target da animare
          if (children && childrenRef.current) {
            allTargets.push(childrenRef.current);
          }
          
          return gsap.fromTo(
            allTargets,
            { ...from },
            {
              ...to,
              duration,
              ease,
              stagger: delay / 1000,
              scrollTrigger: {
                trigger: el,
                start,
                once: true,
                fastScrollEnd: true,
                anticipatePin: 0.4
              },
              onComplete: () => {
                animationCompletedRef.current = true;
                if (animateOnce) {
                  hasAnimatedThisMount.current = true;
                }
                onLetterAnimationComplete?.();
              },
              willChange: 'transform, opacity',
              force3D: true
            }
          );
        }
      });
      el._rbsplitInstance = splitInstance;
      return () => {
        ScrollTrigger.getAll().forEach(st => {
          if (st.trigger === el) st.kill();
        });
        try {
          splitInstance.revert();
        } catch (_) {}
        el._rbsplitInstance = undefined;
      };
    },
    {
      dependencies: [
        text,
        delay,
        duration,
        ease,
        splitType,
        JSON.stringify(from),
        JSON.stringify(to),
        threshold,
        rootMargin,
        fontsLoaded,
        onLetterAnimationComplete,
        children,
        animateOnce,
        animationKey
      ],
      scope: ref
    }
  );

  const renderTag = () => {
    const style: React.CSSProperties = {
      textAlign,
      wordWrap: 'break-word',
      willChange: 'transform, opacity',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem'
    };
    const classes = `split-parent overflow-hidden inline-block whitespace-normal ${className}`;
    const childrenElement = children ? (
      <span ref={childrenRef} style={{ display: 'inline-block' }}>
        {children}
      </span>
    ) : null;
    
    switch (tag) {
      case 'h1':
        return (
          <h1 ref={ref} style={style} className={classes}>
            {text}
            {childrenElement}
          </h1>
        );
      case 'h2':
        return (
          <h2 ref={ref} style={style} className={classes}>
            {text}
            {childrenElement}
          </h2>
        );
      case 'h3':
        return (
          <h3 ref={ref} style={style} className={classes}>
            {text}
            {childrenElement}
          </h3>
        );
      case 'h4':
        return (
          <h4 ref={ref} style={style} className={classes}>
            {text}
            {childrenElement}
          </h4>
        );
      case 'h5':
        return (
          <h5 ref={ref} style={style} className={classes}>
            {text}
            {childrenElement}
          </h5>
        );
      case 'h6':
        return (
          <h6 ref={ref} style={style} className={classes}>
            {text}
            {childrenElement}
          </h6>
        );
      default:
        return (
          <p ref={ref} style={style} className={classes}>
            {text}
            {childrenElement}
          </p>
        );
    }
  };

  return renderTag();
};

export default SplitText;
