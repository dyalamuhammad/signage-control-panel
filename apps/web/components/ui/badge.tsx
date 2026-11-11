import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[var(--primary)]/15 text-[var(--primary)]',
        secondary:
          'border-transparent bg-[var(--secondary)] text-[var(--secondary-foreground)]',
        outline:
          'border-[var(--border)] text-[var(--muted-foreground)] bg-transparent',
        destructive:
          'border-transparent bg-[var(--destructive)]/15 text-[var(--destructive)]',
        success:
          'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
