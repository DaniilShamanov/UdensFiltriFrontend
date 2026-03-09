"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
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
import NotificationBanner from "@/components/NotificationBanner";
import { Link, usePathname, useRouter } from "@/navigation";

export default function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const { user, cart, authLoading, routeLoading, authNotice, clearAuthNotice, signOut } = useApp();
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
    <>
      {routeLoading && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-background/45 backdrop-blur-[1px]">
          <div className="h-12 w-12 rounded-full border-4 border-primary/25 border-t-primary animate-spin shadow-lg" />
        </div>
      )}

      <header className="sticky top-0 z-50 border-b border-primary/20 bg-gradient-to-r from-background/95 via-primary/5 to-secondary/10 backdrop-blur supports-[backdrop-filter]:bg-background/85 shadow-[0_10px_28px_rgba(11,99,206,0.14)]">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 transition-opacity hover:opacity-95 md:gap-3"
              aria-label="Home"
            >
              <div className="bg-gradient-to-br from-secondary via-primary to-accent p-2 rounded-xl shadow-md shadow-primary/25">
                <Droplet className="h-8 w-8 text-white" />
              </div>
              <div className="hidden sm:block">
                <div className="font-bold text-base sm:text-xl text-secondary tracking-tight">WaterFilters</div>
                <div className="text-xs text-muted-foreground">Pure Water Solutions</div>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 lg:flex" aria-label="Primary">
              <Button asChild variant="ghost" className="cursor-pointer rounded-xl text-foreground/90 transition-colors hover:bg-primary hover:text-primary-foreground"><Link href="/">{t("nav.home")}</Link></Button>
              <Button asChild variant="ghost" className="cursor-pointer rounded-xl text-foreground/90 transition-colors hover:bg-primary hover:text-primary-foreground"><Link href="/products">{t("nav.products")}</Link></Button>
              <Button asChild variant="ghost" className="cursor-pointer rounded-xl text-foreground/90 transition-colors hover:bg-primary hover:text-primary-foreground"><Link href="/services">{t("nav.services")}</Link></Button>
              <Button asChild variant="ghost" className="cursor-pointer rounded-xl text-foreground/90 transition-colors hover:bg-primary hover:text-primary-foreground"><Link href="/contact">{t("nav.contact")}</Link></Button>
            </nav>

            <div className="flex items-center gap-1 sm:gap-2">
              <LocaleSwitcher />
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 cursor-pointer rounded-xl hover:bg-primary/15 lg:hidden" aria-label="Menu"><Menu className="h-5 w-5" /></Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[320px] bg-background/95">
                  <SheetHeader><SheetTitle>Menu</SheetTitle></SheetHeader>
                  <nav className="mt-6 flex flex-col gap-2" aria-label="Mobile">
                    <Button asChild variant="ghost" className="cursor-pointer justify-start" onClick={closeMobile}><Link href="/">{t("nav.home")}</Link></Button>
                    <Button asChild variant="ghost" className="cursor-pointer justify-start" onClick={closeMobile}><Link href="/products">{t("nav.products")}</Link></Button>
                    <Button asChild variant="ghost" className="cursor-pointer justify-start" onClick={closeMobile}><Link href="/services">{t("nav.services")}</Link></Button>
                    <Button asChild variant="ghost" className="cursor-pointer justify-start" onClick={closeMobile}><Link href="/contact">{t("nav.contact")}</Link></Button>
                    {user ? (
                      <>
                        <div className="my-2 border-t" />
                        <Button asChild variant="ghost" className="cursor-pointer justify-start" onClick={closeMobile}><Link href="/account"><Settings className="mr-2 h-4 w-4" />{t("nav.account")}</Link></Button>
                        <Button asChild variant="ghost" className="cursor-pointer justify-start" onClick={closeMobile}><Link href="/orders"><Package className="mr-2 h-4 w-4" />{t("nav.orders")}</Link></Button>
                        <Button variant="ghost" className="cursor-pointer justify-start text-destructive" onClick={async () => { await handleLogout(); closeMobile(); }}><LogOut className="mr-2 h-4 w-4" />{t("nav.signOut")}</Button>
                      </>
                    ) : (
                      <>
                        <div className="my-2 border-t" />
                        <Button asChild className="cursor-pointer" onClick={closeMobile}><Link href="/auth/sign-in">{t("nav.signIn")}</Link></Button>
                      </>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>

              <Button asChild variant="ghost" size="icon" className="relative h-10 w-10 cursor-pointer rounded-xl transition-colors hover:bg-primary/15 hover:text-primary" aria-label={t("nav.cart")}>
                <Link href="/cart">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemsCount > 0 && <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent">{cartItemsCount}</Badge>}
                </Link>
              </Button>

              <div className="relative">
                {authLoading ? (
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium opacity-50" aria-label={t("nav.account")} aria-disabled="true">
                    <User className="h-5 w-5" />
                  </div>
                ) : user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-10 w-10 cursor-pointer rounded-xl transition-colors hover:bg-primary/15 hover:text-primary" aria-label={t("nav.account")}><User className="h-5 w-5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52">
                      <DropdownMenuItem onSelect={() => router.push("/account")}><Settings className="mr-2 h-4 w-4" />{t("nav.account")}</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => router.push("/orders")}><Package className="mr-2 h-4 w-4" />{t("nav.orders")}</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={handleLogout}><LogOut className="mr-2 h-4 w-4" />{t("nav.signOut")}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button variant="ghost" size="icon" className="h-10 w-10 cursor-pointer rounded-xl transition-colors hover:bg-primary/15 hover:text-primary" aria-label={t("nav.signIn")} onClick={() => router.push('/auth/sign-in')}>
                    <User className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {authNotice ? <NotificationBanner title={authNotice.title} description={authNotice.description} onDismiss={clearAuthNotice} dismissLabel="Close" variant="warning" /> : null}
        {pathname == "/products" ? <CategoryNav /> : null}
      </header>
    </>
  );
}
