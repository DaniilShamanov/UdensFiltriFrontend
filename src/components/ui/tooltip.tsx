"use client";

import * as React from "react";

type TooltipContextValue = {
  content: React.ReactNode;
  setContent: (node: React.ReactNode) => void;
};

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function Tooltip({ children }: { children: React.ReactNode }) {
  const [content, setContent] = React.useState<React.ReactNode>(null);
  return (
    <TooltipContext.Provider value={{ content, setContent }}>
      {children}
    </TooltipContext.Provider>
  );
}

function TooltipTrigger({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(TooltipContext);
  const title = typeof ctx?.content === "string" ? (ctx?.content as string) : undefined;
  return (
    <span title={title} className="inline-flex">
      {children}
    </span>
  );
}

function TooltipContent({ children }: { children: React.ReactNode }) {
  const ctx = React.useContext(TooltipContext);
  React.useEffect(() => {
    ctx?.setContent(children);
    return () => ctx?.setContent(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);
  return null;
}

export { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent };
