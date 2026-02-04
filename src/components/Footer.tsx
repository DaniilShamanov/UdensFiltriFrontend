import { getTranslations } from "next-intl/server";
import { Link } from "@/navigation";

export default async function Footer() {
  const t = await getTranslations();

  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <div className="font-semibold text-lg text-secondary">WaterFilters</div>
            <p className="mt-3 text-sm text-muted-foreground max-w-md">
              Modern plumbing and water filtration solutions. Designed mobile-first and ready for Django integration.
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold">{t("footer.company")}</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link className="hover:text-foreground" href="/">
                  {t("nav.home")}
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/products">
                  {t("nav.products")}
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/services">
                  {t("nav.services")}
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/contact">
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold">{t("footer.help")}</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link className="hover:text-foreground" href="/info/faq">
                  {t("footer.faq")}
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/info/shipping">
                  {t("footer.shipping")}
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/info/returns">
                  {t("footer.returns")}
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/info/warranty">
                  {t("footer.warranty")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold">{t("footer.legal")}</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link className="hover:text-foreground" href="/info/privacy">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/info/terms">
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/info/cookies">
                  {t("footer.cookies")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t text-xs text-muted-foreground flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} WaterFilters</div>
          <div>LV · RU · EN</div>
        </div>
      </div>
    </footer>
  );
}
