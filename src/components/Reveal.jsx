import { Children, cloneElement, isValidElement, useEffect, useRef, useState } from "react";

function useReveal({ threshold = 0.12, rootMargin = "0px 0px -80px 0px" } = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  return [ref, visible];
}

export function Reveal({ children, className = "" }) {
  const [ref, visible] = useReveal();

  return (
    <div ref={ref} className={`reveal-block ${visible ? "is-visible" : ""} ${className}`.trim()}>
      {children}
    </div>
  );
}

export function Stagger({ children, className = "" }) {
  const [ref, visible] = useReveal({ rootMargin: "0px 0px -60px 0px" });

  const items = Children.map(children, (child, index) => {
    if (!isValidElement(child)) {
      return child;
    }

    const childStyle = child.props.style ?? {};

    return cloneElement(child, {
      revealVisible: visible,
      style: {
        ...childStyle,
        "--reveal-delay": `${index * 90}ms`,
      },
    });
  });

  return (
    <div ref={ref} className={className}>
      {items}
    </div>
  );
}

export function StaggerItem({ children, className = "", revealVisible = false, style }) {
  return (
    <div
      className={`reveal-item ${revealVisible ? "is-visible" : ""} ${className}`.trim()}
      style={style}
    >
      {children}
    </div>
  );
}
