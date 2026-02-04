"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Lock, User as UserIcon, Phone, ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { OtpInput } from "@/components/auth/OtpInput";
import { useApp } from "@/contexts/AppContext";
import { Link, useRouter } from "@/navigation";
import { toast } from "sonner";

type Step = "form" | "verify";

const SignUpPage: React.FC = () => {
  const { signUp, requestSmsCode } = useApp();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>("form");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [code, setCode] = useState("");

  const fullName = useMemo(() => {
    const parts = [formData.first_name.trim(), formData.last_name.trim()].filter(Boolean);
    return parts.join(" ");
  }, [formData.first_name, formData.last_name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const requestCode = async () => {
    setIsSubmitting(true);
    try {
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      if (!formData.agreeToTerms) {
        toast.error("Please agree to the terms and conditions");
        return;
      }
      await requestSmsCode({ purpose: "register", phone: formData.phone });
      toast.success("Code sent", { description: "Check SMS for the verification code." });
      setStep("verify");
    } catch (e: any) {
      toast.error("Failed to send code", { description: e?.message || "Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await signUp({
        phone: formData.phone,
        password: formData.password,
        code,
        email: formData.email || undefined,
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
      });
      toast.success("Account created successfully!");
      const next = searchParams.get("next") || "/";
      router.replace(next);
    } catch (e: any) {
      toast.error("Sign up failed", { description: e?.message || "Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/30 to-primary/5 flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-gradient-to-br from-primary to-secondary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            {step === "form" ? (
              <UserIcon className="h-8 w-8 text-white" />
            ) : (
              <ShieldCheck className="h-8 w-8 text-white" />
            )}
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            {step === "form" ? "Register with your phone number" : `Enter the code we sent to ${formData.phone}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "form" ? (
            <form onSubmit={(e) => { e.preventDefault(); void requestCode(); }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First name</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="first_name" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Raksha" className="pl-10" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="last_name">Last name</Label>
                  <Input id="last_name" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="" />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+37112345678"
                    className="pl-10"
                    autoComplete="tel"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Use international format (e.g. +371...).</p>
              </div>

              <div>
                <Label htmlFor="email">Email (optional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="pl-10"
                    autoComplete="email"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">If provided, we’ll email you payment confirmations.</p>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" name="password" type="password" required value={formData.password} onChange={handleChange} placeholder="••••••••" className="pl-10" autoComplete="new-password" />
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="confirmPassword" name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} placeholder="••••••••" className="pl-10" autoComplete="new-password" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="agreeToTerms"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, agreeToTerms: checked as boolean }))}
                />
                <Label htmlFor="agreeToTerms" className="cursor-pointer font-normal text-sm">
                  I agree to the <Link href="/info/terms" className="text-primary hover:underline">Terms and Conditions</Link>
                </Label>
              </div>

              <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90" disabled={isSubmitting}>
                Send verification code
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Separator />

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link href="/auth/sign-in" className="text-primary hover:underline font-medium">
                  Sign In
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label htmlFor="code">SMS code</Label>
                <OtpInput value={code} onChange={setCode} length={6} />
              </div>

              <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90" disabled={isSubmitting || code.length < 4}>
                Verify & create account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => { void requestCode(); }}
                  disabled={isSubmitting}
                >
                  Resend code
                </button>
                <button type="button" className="text-muted-foreground hover:underline" onClick={() => setStep("form")}>
                  Edit phone
                </button>
              </div>

              <Separator />

              {fullName ? (
                <p className="text-xs text-muted-foreground text-center">Creating account for {fullName}.</p>
              ) : (
                <p className="text-xs text-muted-foreground text-center">You can add your name later in account settings.</p>
              )}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpPage;
