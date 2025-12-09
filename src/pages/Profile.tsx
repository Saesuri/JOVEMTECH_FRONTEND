import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/api";
import type { UserProfile } from "../types/apiTypes";
import { toast } from "sonner";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Phone, Mail, Building2, Save } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Profile = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");

  useEffect(() => {
    if (user) loadProfile();
  }, [user]);

  const loadProfile = async () => {
    try {
      const data = await userService.getProfile(user!.id);
      setProfile(data);
      // Init form
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
      setDepartment(data.department || "Faculty");
    } catch (e) {
      console.error(e);
      toast.error(t("profile.messages.loadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await userService.updateProfile(user!.id, {
        full_name: fullName,
        phone,
        department,
      });
      toast.success(t("profile.messages.updateSuccess"));
    } catch (e) {
      console.error(e);
      toast.error(t("profile.messages.updateFailed"));
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return user?.email?.substring(0, 2).toUpperCase() || "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  if (loading)
    return (
      <div className="p-10 text-center animate-pulse">
        {t("common.loading")}
      </div>
    );

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-20 w-20 border-2 border-primary/10">
            <AvatarImage src="" />
            <AvatarFallback className="text-xl font-bold bg-primary/5 text-primary">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">
              {profile?.full_name || t("profile.title")}
            </CardTitle>
            <CardDescription>{profile?.email}</CardDescription>
            <div className="flex gap-2 mt-2">
              <div className="px-2 py-1 bg-muted rounded text-xs font-medium uppercase tracking-wide">
                {profile?.role}
              </div>
              <div className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100">
                {department}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 mt-4">
          <div className="grid gap-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4" /> {t("profile.fullName")}
            </Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> {t("profile.phone")}
              </Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(XX) XXXXX-XXXX"
              />
            </div>

            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <Building2 className="h-4 w-4" /> {t("profile.department")}
              </Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Faculty">
                    {t("profile.departments.faculty")}
                  </SelectItem>
                  <SelectItem value="IT">
                    {t("profile.departments.it")}
                  </SelectItem>
                  <SelectItem value="Admin">
                    {t("profile.departments.admin")}
                  </SelectItem>
                  <SelectItem value="HR">
                    {t("profile.departments.hr")}
                  </SelectItem>
                  <SelectItem value="Student">
                    {t("profile.departments.student")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2 opacity-50">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> {t("profile.email")}
            </Label>
            <Input value={profile?.email} disabled readOnly />
            <p className="text-xs text-muted-foreground">
              {t("profile.emailNote")}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t pt-6 bg-muted/20">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? t("profile.saving") : t("profile.saveChanges")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Profile;
