'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

export function GameNav() {
  const pathname = usePathname()
  
  const routes = [
    {
      name: "Daily Challenge",
      href: "/boggle/rooms/daily",
    },
    {
      name: "Multiplayer",
      href: "/boggle/rooms",
    },
    {
      name: "Practice",
      href: "/boggle/rooms/practice",
    },
  ]

  return (
    <NavigationMenu className="mb-8">
      <NavigationMenuList>
        {routes.map((route) => (
          <NavigationMenuItem key={route.href}>
            <Link href={route.href} legacyBehavior passHref>
              <NavigationMenuLink 
                className={cn(
                  navigationMenuTriggerStyle(),
                  pathname === route.href && "bg-accent text-accent-foreground"
                )}
              >
                {route.name}
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
} 