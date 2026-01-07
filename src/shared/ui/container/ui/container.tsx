import type { HTMLAttributes } from 'react'

type ContainerProps = HTMLAttributes<HTMLDivElement>

export function Container({ className, ...props }: ContainerProps) {
  return (
    <div
      className={['mx-auto w-full max-w-5xl px-4', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    />
  )
}


