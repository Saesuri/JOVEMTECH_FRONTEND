import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../config/supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

// SHADCN UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KeyRound, Mail, ArrowLeft, Check } from "lucide-react";

const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Password update state (when user arrives via reset link)
  const [isResetMode, setIsResetMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    // Listen for auth state changes - this is the most reliable way to detect recovery
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // User clicked the recovery link and Supabase has authenticated them
        setIsResetMode(true);
      } else if (event === "SIGNED_IN" && session) {
        // Check if this is a recovery session by looking at the URL hash
        // Supabase adds type=recovery to the URL when redirecting from email
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        );
        const type = hashParams.get("type");
        if (type === "recovery") {
          setIsResetMode(true);
        }
      }
    });

    // Check on mount if we're already in a recovery session
    const checkRecoveryState = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get("type");
      const accessToken = hashParams.get("access_token");

      // If URL has recovery type and an access token, we're in recovery mode
      if (type === "recovery" && accessToken) {
        setIsResetMode(true);
        return;
      }

      // Also check if user is already authenticated on this page
      // This happens when Supabase has already processed the recovery URL
      // and the hash is now empty (just #)
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // User is authenticated while on the reset-password page
        // This means they likely came from a recovery link
        setIsResetMode(true);
      }
    };

    checkRecoveryState();

    return () => subscription.unsubscribe();
  }, []);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast.success(t("resetPassword.messages.emailSent"));
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : t("resetPassword.messages.requestFailed");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error(t("resetPassword.messages.passwordMismatch"));
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t("resetPassword.messages.passwordTooShort"));
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast.success(t("resetPassword.messages.passwordUpdated"));

      // Sign out and redirect to login
      await supabase.auth.signOut();
      navigate("/login");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : t("resetPassword.messages.updateFailed");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Password update form (when user clicks reset link)
  if (isResetMode) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors p-4">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
              <KeyRound className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {t("resetPassword.newPasswordTitle")}
            </CardTitle>
            <CardDescription>
              {t("resetPassword.newPasswordSubtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1">
                <Label>{t("resetPassword.newPassword")}</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-1">
                <Label>{t("resetPassword.confirmPassword")}</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <Button className="w-full mt-2" type="submit" disabled={loading}>
                {loading
                  ? t("common.processing")
                  : t("resetPassword.updatePassword")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Email sent confirmation
  if (emailSent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors p-4">
        <Card className="w-full max-w-md shadow-xl border-t-4 border-t-green-500">
          <CardHeader className="text-center">
            <div className="mx-auto bg-green-100 dark:bg-green-900/30 p-3 rounded-full w-fit mb-2">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {t("resetPassword.emailSentTitle")}
            </CardTitle>
            <CardDescription className="text-base">
              {t("resetPassword.emailSentSubtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-muted-foreground">
            <p>{t("resetPassword.checkInbox")}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Link to="/login">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t("resetPassword.backToLogin")}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Request reset form (default)
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {t("resetPassword.title")}
          </CardTitle>
          <CardDescription>{t("resetPassword.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div className="space-y-1">
              <Label>{t("login.email")}</Label>
              <Input
                type="email"
                placeholder="you@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button className="w-full mt-2" type="submit" disabled={loading}>
              {loading ? t("common.processing") : t("resetPassword.submit")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/login">
            <Button variant="link">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("resetPassword.backToLogin")}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPassword;
