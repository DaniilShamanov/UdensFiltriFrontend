"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Mail, Phone, Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/AppContext";
import { useRouter } from "@/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { ApiError } from "@/lib/api";

const AccountPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, authLoading, updateProfile, changeEmail, changePhone, changePassword, signOut } = useApp();
  const t = useTranslations('account');

  const displayName = useMemo(() => {
    const fn = user?.first_name?.trim() || "";
    const ln = user?.last_name?.trim() || "";
    const n = `${fn} ${ln}`.trim();
    return n || user?.email || user?.phone || "";
  }, [user]);

  const [profile, setProfile] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
  });

  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [newPhone, setNewPhone] = useState(user?.phone || "");
  const [newPassword, setNewPassword] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [passwordCode, setPasswordCode] = useState("");
  const [awaitingEmailCode, setAwaitingEmailCode] = useState(false);
  const [awaitingPasswordCode, setAwaitingPasswordCode] = useState(false);

  const getApiErrorMessage = (error: unknown, fallback: string) => {
    if (error instanceof ApiError && typeof error.data === "object" && error.data !== null) {
      const values = Object.values(error.data as Record<string, unknown>)
        .flatMap((v) => (Array.isArray(v) ? v : [v]))
        .map((v) => String(v))
        .filter(Boolean);
      if (values.length > 0) return values.join(" ");
    }
    if (error instanceof Error && error.message) return error.message;
    return fallback;
  };

  useEffect(() => {
    if (!authLoading && !user) {
      const next = encodeURIComponent(pathname);
      router.replace(`/auth/sign-in?next=${next}`);
    }
  }, [user, authLoading, router, pathname]);

  useEffect(() => {
    setProfile({
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
    });
    setNewEmail(user?.email || "");
    setNewPhone(user?.phone || "");
  }, [user?.first_name, user?.last_name, user?.email, user?.phone]);

  if (authLoading) return <p>Loading</p>;
  if (!user) return null;

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ first_name: profile.first_name.trim(), last_name: profile.last_name.trim() });
      toast.success(t('toast.profileUpdated'));
    } catch {
      toast.error(t('toast.profileUpdateFailed'));
    }
  };

  const doChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const normalizedEmail = newEmail?.trim() || undefined;
      const normalizedCode = emailCode.trim();
      if (!awaitingEmailCode && !normalizedCode) {
        await changeEmail({ email: normalizedEmail });
        setAwaitingEmailCode(true);
        toast.success(t('toast.verificationCodeSent'));
        return;
      }

      await changeEmail({ email: normalizedEmail, code: normalizedCode || undefined });
      setAwaitingEmailCode(false);
      setEmailCode("");
      toast.success(t('toast.emailUpdated'));
    } catch (error) {
      toast.error(t('toast.emailUpdateFailed'), {
        description: getApiErrorMessage(error, t('toast.checkCode')),
      });
    }
  };

  const doChangePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await changePhone({ new_phone: newPhone.trim() });
      toast.success(t('toast.phoneUpdated'));
    } catch (error) {
      toast.error(t('toast.phoneUpdateFailed'), {
        description: getApiErrorMessage(error, t('toast.checkPhoneFormat')),
      });
    }
  };

  const doChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error(t('toast.passwordTooShort', { min: 6, current: newPassword.length }));
      return;
    }
    try {
      const normalizedCode = passwordCode.trim();
      if (!awaitingPasswordCode && !normalizedCode) {
        await changePassword({ new_password: newPassword });
        setAwaitingPasswordCode(true);
        toast.success(t('toast.verificationCodeSent'));
        return;
      }

      await changePassword({ new_password: newPassword, code: normalizedCode || undefined });
      toast.success(t('toast.passwordUpdated'), { description: t('toast.signInAgain') });
      setNewPassword("");
      setPasswordCode("");
      setAwaitingPasswordCode(false);
      await signOut();
      router.replace("/auth/sign-in");
    } catch (error) {
      toast.error(t('toast.passwordUpdateFailed'), {
        description: getApiErrorMessage(error, t('toast.checkCode')),
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background py-6 sm:py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-1 text-2xl font-bold text-secondary sm:text-3xl">{t('title')}</h1>
          <p className="text-muted-foreground">{t('signedInAs', { name: displayName })}</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-primary/10">
            <TabsTrigger value="profile" className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t('tabs.profile')}</TabsTrigger>
            <TabsTrigger value="security" className="cursor-pointer data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">{t('tabs.security')}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="border-primary/20 bg-card/95 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-primary/8 to-secondary/8">
                <CardTitle>{t('profile.title')}</CardTitle>
                <CardDescription>{t('profile.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={saveProfile} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">{t('profile.firstName')}</Label>
                      <Input id="first_name" value={profile.first_name} onChange={(e) => setProfile((p) => ({ ...p, first_name: e.target.value }))} />
                    </div>
                    <div>
                      <Label htmlFor="last_name">{t('profile.lastName')}</Label>
                      <Input id="last_name" value={profile.last_name} onChange={(e) => setProfile((p) => ({ ...p, last_name: e.target.value }))} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full cursor-pointer bg-primary hover:bg-primary/90 sm:w-auto">
                    <Save className="mr-2 h-4 w-4" /> {t('profile.saveName')}
                  </Button>
                </form>

                <Separator />

                <div className="grid gap-6">
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 font-medium"><Phone className="h-4 w-4" /> {t('profile.phone')}</div>
                    <form onSubmit={doChangePhone} className="mt-4 grid gap-3">
                      <Label htmlFor="new_phone">{t('profile.phone')}</Label>
                      <Input id="new_phone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder={t('profile.phonePlaceholder')} />
                      <Button type="submit" className="cursor-pointer bg-primary hover:bg-primary/90">{t('profile.updatePhone')}</Button>
                    </form>
                  </div>

                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 font-medium"><Mail className="h-4 w-4" /> {t('profile.email')}</div>
                    <form onSubmit={doChangeEmail} className="mt-4 grid gap-3">
                      <Label htmlFor="email">{t('profile.email')}</Label>
                      <Input id="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder={t('profile.emailPlaceholder')} />
                      {awaitingEmailCode && (
                        <div className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground">
                          {t('profile.codeBanner')}
                        </div>
                      )}
                      <Label htmlFor="email_code">{t('profile.emailCode')}</Label>
                      <Input id="email_code" value={emailCode} onChange={(e) => setEmailCode(e.target.value)} placeholder={t('profile.codePlaceholder')} autoComplete="one-time-code" />
                      <Button type="submit" className="cursor-pointer bg-primary hover:bg-primary/90">{awaitingEmailCode || emailCode.trim() ? t('profile.confirmCode') : t('profile.updateEmail')}</Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="border-primary/20 bg-card/95 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-primary/8 to-secondary/8">
                <CardTitle>{t('security.title')}</CardTitle>
                <CardDescription>{t('security.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={doChangePassword} className="grid gap-3">
                  <Label htmlFor="new_password">{t('security.newPassword')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="new_password" type="password" minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-10" />
                  </div>
                  {awaitingPasswordCode && (
                    <div className="rounded-md border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-foreground">
                      {t('security.codeBanner')}
                    </div>
                  )}
                  <Label htmlFor="password_code">{t('security.emailCode')}</Label>
                  <Input id="password_code" value={passwordCode} onChange={(e) => setPasswordCode(e.target.value)} placeholder={t('security.codePlaceholder')} autoComplete="one-time-code" />
                  <Button type="submit" className="cursor-pointer bg-primary hover:bg-primary/90">{awaitingPasswordCode || passwordCode.trim() ? t('security.confirmCode') : t('security.updatePassword')}</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AccountPage;
