"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"


export function ThemeToggle() {
  const { setTheme , theme} = useTheme()

  return (
 <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
    {
        theme === "light" ? <Moon className="size-5"/> : <Sun className="size-5" />
    }
 </Button>
  )
}