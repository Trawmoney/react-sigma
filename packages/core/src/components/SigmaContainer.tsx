import React, { CSSProperties, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { isEqual } from "lodash";
import Graph from "graphology";
import { GraphConstructor } from "graphology-types";
import { Sigma } from "sigma";
import { Settings } from "sigma/settings";

import { SigmaProvider } from "../hooks/context";

/**
 * Properties for `SigmaContainer` component
 */
export interface SigmaContainerProps {
  /**
   * Graphology instance or constructor
   */
  graph?: Graph | GraphConstructor;
  /**
   * Sigma initial settings
   */
  initialSettings?: Partial<Settings>;
  /**
   * HTML id
   */
  id?: string;
  /**
   * HTML class
   */
  className?: string;
  /**
   * HTML CSS style
   */
  style?: CSSProperties;
  /**
   * @hidden
   */
  children?: ReactNode;
}

/**
 * The `SigmaContainer` component is responsible of create the Sigma instance, and provide it to its child components using a React Context that can be accessible via the hook {@link useSigma}.
 *
 * ```jsx
 * <SigmaContainer id="sigma-graph">
 *   <MyCustomGraph />
 * </SigmaContainer>
 *```
 * See [[SigmaContainerProps]] for more information.
 *
 * @category Component
 */
export const SigmaContainer: React.FC<SigmaContainerProps> = ({
  graph,
  id,
  className,
  style,
  initialSettings,
  children,
}: SigmaContainerProps) => {
  // Root HTML element
  const rootRef = useRef<HTMLDivElement>(null);
  // HTML element for the sigma instance
  const containerRef = useRef<HTMLDivElement>(null);
  // Common html props for the container
  const props = { className: `react-sigma ${className ? className : ""}`, id, style };
  // Sigma instance
  const [sigma, setSigma] = useState<Sigma | null>(null);
  // Sigma settings
  const settings = useRef<Partial<Settings>>();
  if (!isEqual(settings.current, initialSettings)) settings.current = initialSettings;

  // When graphOptions or settings changed
  useEffect(() => {
    let instance: Sigma | null = null;

    if (containerRef.current !== null) {
      const sigGraph = graph ? (typeof graph === "function" ? new graph() : graph) : new Graph();
      instance = new Sigma(sigGraph, containerRef.current, settings.current);
    }
    setSigma(instance);

    return () => {
      if (instance) {
        instance.kill();
      }
      setSigma(null);
    };
  }, [containerRef, graph, settings]);

  const context = useMemo(
    () => (sigma && rootRef.current ? { sigma, container: rootRef.current as HTMLElement } : null),
    [sigma, rootRef.current],
  );
  const contents = context !== null ? <SigmaProvider value={context}>{children}</SigmaProvider> : null;

  return (
    <div {...props} ref={rootRef}>
      <div className="sigma-container" ref={containerRef} />
      {contents}
    </div>
  );
};
