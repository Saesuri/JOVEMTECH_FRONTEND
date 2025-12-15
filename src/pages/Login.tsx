import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "../config/supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { userService } from "../services/api";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, User, Phone } from "lucide-react";

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("Faculty");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // 1. Validate extra fields
        if (!fullName || !phone) {
          toast.error(t("login.messages.fillAllFields"));
          setLoading(false);
          return;
        }

        // 2. Create User in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email,
            password,
          }
        );

        if (authError) throw authError;

        if (authData.user) {
          // 3. Update the Profile row
          await new Promise((r) => setTimeout(r, 1000));

          try {
            await userService.updateProfile(authData.user.id, {
              full_name: fullName,
              phone,
              department,

            });
            toast.success(t("login.messages.accountCreated"));
            navigate("/book");
          } catch (profileError) {
            console.error("Profile update failed", profileError);
            toast.warning(t("login.messages.profileSaveFailed"));
          }
        } else {
          toast.info(t("login.messages.checkEmail"));
        }
      } else {
        // LOGIN FLOW
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        toast.success(t("login.messages.welcome"));
        navigate("/book");
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Authentication failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-2">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? t("login.titleSignup") : t("login.title")}
          </CardTitle>
          <CardDescription>
            {isSignUp ? t("login.subtitleSignup") : t("login.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            {/* EXTRA FIELDS FOR SIGN UP */}
            {isSignUp && (
              <div className="space-y-3 animate-in slide-in-from-top-4 duration-300">
                <div className="space-y-1">
                  <Label>{t("login.fullName")}</Label>
                  <div className="relative">
                    <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g. John Doe"
                      className="pl-8"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>{t("login.phone")}</Label>
                  <div className="relative">
                    <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="(11) 99999-9999"
                      className="pl-8"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label>{t("login.department")}</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Faculty">
                        {t("login.departments.faculty")}
                      </SelectItem>
                      <SelectItem value="IT">
                        {t("login.departments.it")}
                      </SelectItem>
                      <SelectItem value="Admin">
                        {t("login.departments.admin")}
                      </SelectItem>
                      <SelectItem value="HR">
                        {t("login.departments.hr")}
                      </SelectItem>
                      <SelectItem value="Student">
                        {t("login.departments.student")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* STANDARD FIELDS */}
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
            <div className="space-y-1">
              <Label>{t("login.password")}</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button className="w-full mt-2" type="submit" disabled={loading}>
              {loading
                ? t("common.processing")
                : isSignUp
                ? t("login.submitSignup")
                : t("login.submit")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button variant="link" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? t("login.switchToLogin") : t("login.switchToSignup")}
          </Button>
          {!isSignUp && (
            <Link to="/reset-password">
              <Button variant="link" className="text-muted-foreground text-sm">
                {t("login.forgotPassword")}
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
