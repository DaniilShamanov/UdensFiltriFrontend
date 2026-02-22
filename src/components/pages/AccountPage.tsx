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
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      const next = encodeURIComponent(pathname);
      router.replace(`/auth/sign-in?next=${next}`);
    }
  }, [user, authLoading, router, pathname]);

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
      await changeEmail({ email: newEmail?.trim() || undefined });
      toast.success(t('toast.emailUpdated'));
    } catch {
      toast.error(t('toast.emailUpdateFailed'));
    }
  };

  const doChangePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await changePhone({ new_phone: newPhone.trim() });
      toast.success(t('toast.phoneUpdated'));
      setNewPhone("");
    } catch {
      toast.error(t('toast.phoneUpdateFailed'), { description: t('toast.checkPhoneFormat') });
    }
  };

  const doChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await changePassword({ new_password: newPassword });
      toast.success(t('toast.passwordUpdated'), { description: t('toast.signInAgain') });
      setNewPassword("");
      await signOut();
      router.replace("/auth/sign-in");
    } catch {
      toast.error(t('toast.passwordUpdateFailed'));
    }
  };

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">{t('title')}</h1>
          <p className="text-muted-foreground">{t('signedInAs', { name: displayName })}</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">{t('tabs.profile')}</TabsTrigger>
            <TabsTrigger value="security">{t('tabs.security')}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
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
                  <Button type="submit" className="bg-accent hover:bg-accent/90 w-full sm:w-auto">
                    <Save className="mr-2 h-4 w-4" /> {t('profile.saveName')}
                  </Button>
                </form>

                <Separator />

                <div className="grid gap-6">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 font-medium"><Phone className="h-4 w-4" /> {t('profile.phone')}</div>
                    <div className="text-sm text-muted-foreground">{user.phone || t('profile.notSet')}</div>
                    <form onSubmit={doChangePhone} className="mt-4 grid gap-3">
                      <Label htmlFor="new_phone">{t('profile.newPhone')}</Label>
                      <Input id="new_phone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder={t('profile.phonePlaceholder')} />
                      <Button type="submit" className="bg-accent hover:bg-accent/90">{t('profile.updatePhone')}</Button>
                    </form>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex items-center gap-2 font-medium"><Mail className="h-4 w-4" /> {t('profile.email')}</div>
                    <div className="text-sm text-muted-foreground">{user.email || t('profile.notSet')}</div>
                    <form onSubmit={doChangeEmail} className="mt-4 grid gap-3">
                      <Label htmlFor="email">{t('profile.email')}</Label>
                      <Input id="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder={t('profile.emailPlaceholder')} />
                      <Button type="submit" className="bg-accent hover:bg-accent/90">{t('profile.updateEmail')}</Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>{t('security.title')}</CardTitle>
                <CardDescription>{t('security.description')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={doChangePassword} className="grid gap-3">
                  <Label htmlFor="new_password">{t('security.newPassword')}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="new_password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-10" />
                  </div>
                  <Button type="submit" className="bg-accent hover:bg-accent/90">{t('security.updatePassword')}</Button>
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
