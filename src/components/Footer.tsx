import { getTranslations } from "next-intl/server";
import { Link } from "@/navigation";

export default async function Footer() {
  const t = await getTranslations('footer');

  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <div className="font-semibold text-lg text-secondary">{t('brand')}</div>
            <p className="mt-3 text-sm text-muted-foreground max-w-md">
              {t('description')}
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold">{t('company')}</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link className="hover:text-foreground" href="/">{t('home')}</Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/products">{t('products')}</Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/services">{t('services')}</Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/contact">{t('contact')}</Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold">{t('help')}</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link className="hover:text-foreground" href="/info/faq">{t('faq')}</Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/info/shipping">{t('shipping')}</Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/info/returns">{t('returns')}</Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/info/warranty">{t('warranty')}</Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold">{t('legal')}</div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link className="hover:text-foreground" href="/info/privacy">{t('privacy')}</Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/info/terms">{t('terms')}</Link>
              </li>
              <li>
                <Link className="hover:text-foreground" href="/info/cookies">{t('cookies')}</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t text-xs text-muted-foreground flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div>{t('copyright', { year: new Date().getFullYear() })}</div>
          <div>{t('languages')}</div>
        </div>
      </div>
    </footer>
  );
}