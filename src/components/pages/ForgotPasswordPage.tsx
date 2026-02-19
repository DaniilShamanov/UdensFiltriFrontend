"use client";

import React, { useState } from "react";
import { Mail, ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/auth/api";
import { Link } from "@/navigation";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function ForgotPasswordPage() {
  const t = useTranslations('forgotPassword');
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authApi.requestPasswordReset({ email });
      setSent(true);
      toast.success(t('toast.successTitle'), {
        description: t('toast.successDescription'),
      });
    } catch {
      toast.error(t('toast.errorTitle'), {
        description: t('toast.errorDescription'),
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-primary/5 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-gradient-to-br from-primary to-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <KeyRound className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">{t('title')}</CardTitle>
          <CardDescription>
            {sent ? t('description.after') : t('description.before')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">{t('emailLabel')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90">
                {t('submitButton')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="text-center">
                <Link href="/auth/sign-in" className="text-sm text-primary hover:underline">
                  {t('backToSignIn')}
                </Link>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <Button asChild size="lg" className="w-full">
                <Link href="/auth/sign-in">{t('returnToSignIn')}</Link>
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                {t('closeMessage')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}