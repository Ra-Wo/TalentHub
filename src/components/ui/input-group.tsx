import * as React from "react";

import { cn } from "@/lib/utils";

function InputGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        "flex items-center rounded-md border border-input bg-background shadow-xs has-disabled:pointer-events-none [&>:not(input):not(button):not([role=button])]:pointer-events-none [&>:not(input):not(button):not([role=button])]:text-muted-foreground dark:has-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

function InputGroupText({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      data-slot="input-group-text"
      className={cn(
        "flex h-9 items-center justify-center px-3 text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { InputGroup, InputGroupText };
