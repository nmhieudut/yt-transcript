import type React from "react"
import type { Metadata } from "next"
import { Be_Vietnam_Pro } from "next/font/google"
import "./globals.css"

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Script & Image Generator",
  description: "Tạo kịch bản 8 nhánh và prompts hình ảnh bằng AI",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body className={beVietnam.className}>{children}</body>
    </html>
  )
}
