import { getTranslations } from "next-intl/server";
import { Link } from "@/navigation";

export default async function Footer() {
  const t = await getTranslations('footer');

  return (
    <footer className="border-t border-blue-900 bg-blue-950 text-blue-100">
      <div className="container mx-auto px-4 py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="inline-flex rounded-full bg-blue-900/80 px-3 py-1 text-lg font-semibold text-white">{t('brand')}</div>
            <p className="mt-3 max-w-md text-sm text-blue-200">
              {t('description')}
            </p>
          </div>

          <div>
            <div className="text-sm font-semibold text-white">{t('company')}</div>
            <ul className="mt-3 space-y-2 text-sm text-blue-200">
              <li>
                <Link className="hover:text-white" href="/">{t('home')}</Link>
              </li>
              <li>
                <Link className="hover:text-white" href="/products">{t('products')}</Link>
              </li>
              <li>
                <Link className="hover:text-white" href="/services">{t('services')}</Link>
              </li>
              <li>
                <Link className="hover:text-white" href="/contact">{t('contact')}</Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold text-white">{t('help')}</div>
            <ul className="mt-3 space-y-2 text-sm text-blue-200">
              <li>
                <Link className="hover:text-white" href="/info/faq">{t('faq')}</Link>
              </li>
              <li>
                <Link className="hover:text-white" href="/info/shipping">{t('shipping')}</Link>
              </li>
              <li>
                <Link className="hover:text-white" href="/info/returns">{t('returns')}</Link>
              </li>
              <li>
                <Link className="hover:text-white" href="/info/warranty">{t('warranty')}</Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold text-white">{t('legal')}</div>
            <ul className="mt-3 space-y-2 text-sm text-blue-200">
              <li>
                <Link className="hover:text-white" href="/info/privacy">{t('privacy')}</Link>
              </li>
              <li>
                <Link className="hover:text-white" href="/info/terms">{t('terms')}</Link>
              </li>
              <li>
                <Link className="hover:text-white" href="/info/cookies">{t('cookies')}</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-blue-900 pt-6 text-xs text-blue-300 sm:flex-row sm:items-center sm:justify-between">
          <div>{t('copyright', { year: new Date().getFullYear() })}</div>
          <div>{t('languages')}</div>
        </div>
      </div>
    </footer>
  );
}
