"use client";

import React, { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ShoppingCart, User, Droplet, LogOut, Package, Settings, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useApp } from "@/contexts/AppContext";
import CategoryNav from "@/components/CategoryNav";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { Link, useRouter } from "@/navigation";
import type { AppLocale } from "@/i18n/routing";

export default function Header() {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const { user, cart, signOut } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      router.push("/");
    }
  };

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            aria-label="Home"
          >
            <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-lg">
              <Droplet className="h-8 w-8 text-white" />
            </div>
            <div className="hidden md:block">
              <div className="font-bold text-xl text-secondary tracking-tight">WaterFilters</div>
              <div className="text-xs text-muted-foreground">Pure Water Solutions</div>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-2" aria-label="Primary">
            <Button asChild variant="ghost">
              <Link href="/">{t("nav.home")}</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/products">{t("nav.products")}</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/services">{t("nav.services")}</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/contact">{t("nav.contact")}</Link>
            </Button>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <LocaleSwitcher currentLocale={locale} />

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2 mt-6" aria-label="Mobile">
                  <Button asChild variant="ghost" className="justify-start" onClick={closeMobile}>
                    <Link href="/">{t("nav.home")}</Link>
                  </Button>
                  <Button asChild variant="ghost" className="justify-start" onClick={closeMobile}>
                    <Link href="/products">{t("nav.products")}</Link>
                  </Button>
                  <Button asChild variant="ghost" className="justify-start" onClick={closeMobile}>
                    <Link href="/services">{t("nav.services")}</Link>
                  </Button>
                  <Button asChild variant="ghost" className="justify-start" onClick={closeMobile}>
                    <Link href="/contact">{t("nav.contact")}</Link>
                  </Button>

                  {user ? (
                    <>
                      <div className="my-2 border-t" />
                      <Button asChild variant="ghost" className="justify-start" onClick={closeMobile}>
                        <Link href="/account">
                          <Settings className="mr-2 h-4 w-4" />
                          {t("nav.account")}
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" className="justify-start" onClick={closeMobile}>
                        <Link href="/orders">
                          <Package className="mr-2 h-4 w-4" />
                          {t("nav.orders")}
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        className="justify-start text-destructive"
                        onClick={async () => {
                          await handleLogout();
                          closeMobile();
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        {t("nav.signOut")}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="my-2 border-t" />
                      <Button asChild onClick={closeMobile}>
                        <Link href="/auth/sign-in">{t("nav.signIn")}</Link>
                      </Button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>

            {/* Cart */}
            <Button asChild variant="ghost" size="icon" className="relative" aria-label={t("nav.cart")}>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent">
                    {cartItemsCount}
                  </Badge>
                )}
              </Link>
            </Button>

            {/* User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="User menu">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => router.push("/account")}>
                    <Settings className="mr-2 h-4 w-4" />
                    {t("nav.account")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/orders")}>
                    <Package className="mr-2 h-4 w-4" />
                    {t("nav.orders")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("nav.signOut")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm">
                <Link href="/auth/sign-in">{t("nav.signIn")}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <CategoryNav />
    </header>
  );
}
