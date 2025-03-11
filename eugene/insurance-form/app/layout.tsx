import type { Metadata } from 'next'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { DebugProvider } from "@/hooks/DebugContext"
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'Insurance Application Form',
  description: 'Complete your insurance application',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen p-0 m-0">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <DebugProvider>
            {children}
            <Toaster />
          </DebugProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
