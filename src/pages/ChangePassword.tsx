import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../config/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

// SHADCN UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { KeyRound, Lock, ShieldCheck } from "lucide-react";

const ChangePassword: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (newPassword !== confirmPassword) {
      toast.error(t("changePassword.messages.passwordMismatch"));
      return;
    }

    if (newPassword.length < 6) {
      toast.error(t("changePassword.messages.passwordTooShort"));
      return;
    }

    if (currentPassword === newPassword) {
      toast.error(t("changePassword.messages.samePassword"));
      return;
    }

    setLoading(true);

    try {
      // 1. Verify current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword,
      });

      if (signInError) {
        toast.error(t("changePassword.messages.currentPasswordWrong"));
        setLoading(false);
        return;
      }

      // 2. Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      toast.success(t("changePassword.messages.success"));

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : t("changePassword.messages.failed");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full">
            <KeyRound className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">
              {t("changePassword.title")}
            </CardTitle>
            <CardDescription>{t("changePassword.subtitle")}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 mt-4">
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Lock className="h-4 w-4" />{" "}
                {t("changePassword.currentPassword")}
              </Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="border-t pt-6 space-y-4">
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />{" "}
                  {t("changePassword.newPassword")}
                </Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <p className="text-xs text-muted-foreground">
                  {t("changePassword.passwordRequirement")}
                </p>
              </div>

              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />{" "}
                  {t("changePassword.confirmPassword")}
                </Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <CardFooter className="flex justify-end px-0 pt-4">
              <Button type="submit" disabled={loading} className="gap-2">
                <KeyRound className="h-4 w-4" />
                {loading ? t("common.processing") : t("changePassword.submit")}
              </Button>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;
