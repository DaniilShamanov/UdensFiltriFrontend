"use client";

import React, { useMemo, useState } from "react";
import { Mail, Phone, Lock, Save, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/AppContext";
import { useRouter } from "@/navigation";
import { toast } from "sonner";
import { OtpInput } from "@/components/auth/OtpInput";

const AccountPage: React.FC = () => {
  const router = useRouter();
  const { user, updateProfile, requestSmsCode, changeEmail, changePhone, changePassword, signOut } = useApp();

  const displayName = useMemo(() => {
    const fn = user?.first_name?.trim() || "";
    const ln = user?.last_name?.trim() || "";
    const n = `${fn} ${ln}`.trim();
    return n || user?.phone || "";
  }, [user]);

  const [profile, setProfile] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
  });

  const [smsSent, setSmsSent] = useState(false);
  const [code, setCode] = useState("");

  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [newPhone, setNewPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");

  if (!user) {
    router.replace("/auth/sign-in?next=/account");
    return null;
  }

  const sendSensitiveCode = async () => {
    try {
      await requestSmsCode({ purpose: "sensitive" });
      setSmsSent(true);
      toast.success("Code sent", { description: `We sent a code to ${user.phone}` });
    } catch {
      toast.error("Could not send code");
    }
  };

  const resetCode = () => {
    setSmsSent(false);
    setCode("");
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ first_name: profile.first_name, last_name: profile.last_name });
      toast.success("Profile updated");
    } catch {
      toast.error("Could not update profile");
    }
  };

  const doChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsSent) await sendSensitiveCode();
    if (!code) return;
    try {
      await changeEmail({ email: newEmail?.trim() || undefined, code });
      toast.success("Email updated");
      resetCode();
    } catch {
      toast.error("Could not update email", { description: "Check the code and try again." });
    }
  };

  const doChangePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsSent) await sendSensitiveCode();
    if (!code) return;
    try {
      await changePhone({ new_phone: newPhone, code });
      toast.success("Phone updated");
      resetCode();
      setNewPhone("");
    } catch {
      toast.error("Could not update phone", { description: "Check the code and phone format (+371...)." });
    }
  };

  const doChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsSent) await sendSensitiveCode();
    if (!code) return;
    try {
      await changePassword({ new_password: newPassword, code });
      toast.success("Password updated", { description: "Please sign in again." });
      resetCode();
      setNewPassword("");
      await signOut();
      router.replace("/auth/sign-in");
    } catch {
      toast.error("Could not update password");
    }
  };

  return (
    <div className="min-h-screen bg-background py-6 sm:py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Account Settings</h1>
          <p className="text-muted-foreground">Signed in as <span className="font-medium">{displayName}</span></p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal information</CardTitle>
                <CardDescription>Name can be changed instantly. Phone/email require SMS code.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={saveProfile} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First name</Label>
                      <Input
                        id="first_name"
                        value={profile.first_name}
                        onChange={(e) => setProfile((p) => ({ ...p, first_name: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last name</Label>
                      <Input
                        id="last_name"
                        value={profile.last_name}
                        onChange={(e) => setProfile((p) => ({ ...p, last_name: e.target.value }))}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="bg-accent hover:bg-accent/90 w-full sm:w-auto">
                    <Save className="mr-2 h-4 w-4" /> Save name
                  </Button>
                </form>

                <Separator />

                <div className="grid gap-6">
                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 font-medium"><Phone className="h-4 w-4" /> Phone</div>
                        <div className="text-sm text-muted-foreground">{user.phone}</div>
                      </div>
                      <Button variant="outline" onClick={sendSensitiveCode} className="w-full sm:w-auto">
                        <ShieldCheck className="mr-2 h-4 w-4" /> Send code
                      </Button>
                    </div>
                    <form onSubmit={doChangePhone} className="mt-4 grid gap-3">
                      <Label htmlFor="new_phone">New phone</Label>
                      <Input id="new_phone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+37112345678" />
                      <Label>SMS code</Label>
                      <OtpInput value={code} onChange={setCode} />
                      <Button type="submit" className="bg-accent hover:bg-accent/90">Update phone</Button>
                      <p className="text-xs text-muted-foreground">Code is sent to your current phone number.</p>
                    </form>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2 font-medium"><Mail className="h-4 w-4" /> Email (optional)</div>
                        <div className="text-sm text-muted-foreground">{user.email || "Not set"}</div>
                      </div>
                      <Button variant="outline" onClick={sendSensitiveCode} className="w-full sm:w-auto">
                        <ShieldCheck className="mr-2 h-4 w-4" /> Send code
                      </Button>
                    </div>
                    <form onSubmit={doChangeEmail} className="mt-4 grid gap-3">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="(optional)" />
                      <Label>SMS code</Label>
                      <OtpInput value={code} onChange={setCode} />
                      <Button type="submit" className="bg-accent hover:bg-accent/90">Update email</Button>
                      <p className="text-xs text-muted-foreground">If email is empty, receipts will only be stored in your account.</p>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Changing password requires an SMS code.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" onClick={sendSensitiveCode} className="w-full sm:w-auto">
                  <ShieldCheck className="mr-2 h-4 w-4" /> Send code
                </Button>

                <form onSubmit={doChangePassword} className="grid gap-3">
                  <Label htmlFor="new_password">New password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="new_password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pl-10" />
                  </div>
                  <Label>SMS code</Label>
                  <OtpInput value={code} onChange={setCode} />
                  <Button type="submit" className="bg-accent hover:bg-accent/90">Update password</Button>
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
